from datetime import datetime, timedelta
from typing import Any, Optional, Union

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.models import User
from app.schemas import TokenData

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def create_access_token(subject: Union[str, int], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta
    to_encode: dict[str, Any] = {'sub': str(subject), 'exp': expire}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: Optional[str] = payload.get('sub')
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=int(user_id))
    except (JWTError, ValueError):
        raise credentials_exception

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == token_data.user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise credentials_exception
        return user
