from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.models import Category, Goal, Profile, User, UserSettings
from app.schemas import (
    Category,
    CategoryCreate,
    Goal,
    GoalCreate,
    Profile,
    ProfileCreate,
    Token,
    UserCreate,
    UserLogin,
    UserMe,
    UserSettings,
    UserSettingsCreate,
)
from app.security import create_access_token, get_current_user, get_password_hash, verify_password

settings = get_settings()
app = FastAPI(title='Resolutions API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
async def health_check() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/auth/register', response_model=Token)
async def register_user(payload: UserCreate) -> Token:
    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(User).where(User.email == payload.email.lower()))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')

        user = User(
            email=payload.email.lower(),
            password_hash=get_password_hash(payload.password),
            full_name=payload.full_name,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        profile = Profile(user_id=user.id, theme='classic')
        settings_row = UserSettings(user_id=user.id, theme='classic', language='pl', notifications_enabled=True)
        session.add_all([profile, settings_row])
        await session.commit()

        access_token = create_access_token(user.id)
        return Token(access_token=access_token)


@app.post('/api/auth/login', response_model=Token)
async def login_user(payload: UserLogin) -> Token:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == payload.email.lower()))
        user = result.scalar_one_or_none()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')

        access_token = create_access_token(user.id)
        return Token(access_token=access_token)


@app.get('/api/users/me', response_model=UserMe)
async def get_me(current_user: User = Depends(get_current_user)) -> UserMe:
    return UserMe(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
    )


@app.get('/api/profiles/me', response_model=Profile)
async def get_profile(current_user: User = Depends(get_current_user)) -> Profile:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Profile).where(Profile.user_id == current_user.id))
        profile = result.scalar_one_or_none()
        if not profile:
            profile = Profile(user_id=current_user.id, theme='classic')
            session.add(profile)
            await session.commit()
            await session.refresh(profile)

        return profile


@app.put('/api/profiles/me', response_model=Profile)
async def update_profile(payload: ProfileCreate, current_user: User = Depends(get_current_user)) -> Profile:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Profile).where(Profile.user_id == current_user.id))
        profile = result.scalar_one_or_none()
        if not profile:
            profile = Profile(user_id=current_user.id)
            session.add(profile)

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)

        await session.commit()
        await session.refresh(profile)
        return profile


@app.get('/api/categories', response_model=list[Category])
async def list_categories(current_user: User = Depends(get_current_user)) -> list[Category]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Category).where(Category.user_id == current_user.id).order_by(Category.order_index.asc()))
        return list(result.scalars().all())


@app.post('/api/categories', response_model=Category)
async def create_category(payload: CategoryCreate, current_user: User = Depends(get_current_user)) -> Category:
    async with AsyncSessionLocal() as session:
        category = Category(user_id=current_user.id, **payload.model_dump())
        session.add(category)
        await session.commit()
        await session.refresh(category)
        return category


@app.put('/api/categories/{category_id}', response_model=Category)
async def update_category(category_id: int, payload: CategoryCreate, current_user: User = Depends(get_current_user)) -> Category:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Category).where(Category.id == category_id, Category.user_id == current_user.id))
        category = result.scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Category not found')

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(category, field, value)

        await session.commit()
        await session.refresh(category)
        return category


@app.delete('/api/categories/{category_id}')
async def delete_category(category_id: int, current_user: User = Depends(get_current_user)) -> dict[str, str]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Category).where(Category.id == category_id, Category.user_id == current_user.id))
        category = result.scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Category not found')

        await session.delete(category)
        await session.commit()
        return {'status': 'deleted'}


@app.get('/api/goals', response_model=list[Goal])
async def list_goals(current_user: User = Depends(get_current_user)) -> list[Goal]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Goal).where(Goal.user_id == current_user.id).order_by(Goal.order_index.asc()))
        return list(result.scalars().all())


@app.post('/api/goals', response_model=Goal)
async def create_goal(payload: GoalCreate, current_user: User = Depends(get_current_user)) -> Goal:
    async with AsyncSessionLocal() as session:
        category_exists = await session.execute(
            select(Category).where(Category.id == payload.category_id, Category.user_id == current_user.id)
        )
        if not category_exists.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Category not found')

        goal = Goal(user_id=current_user.id, **payload.model_dump(exclude={'category_id'}), category_id=payload.category_id)
        session.add(goal)
        await session.commit()
        await session.refresh(goal)
        return goal


@app.put('/api/goals/{goal_id}', response_model=Goal)
async def update_goal(goal_id: int, payload: GoalCreate, current_user: User = Depends(get_current_user)) -> Goal:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id))
        goal = result.scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Goal not found')

        if payload.category_id != goal.category_id:
            category_exists = await session.execute(
                select(Category).where(Category.id == payload.category_id, Category.user_id == current_user.id)
            )
            if not category_exists.scalar_one_or_none():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Category not found')

        for field, value in payload.model_dump(exclude_unset=True).items():
            if field != 'category_id':
                setattr(goal, field, value)
            else:
                goal.category_id = value

        await session.commit()
        await session.refresh(goal)
        return goal


@app.delete('/api/goals/{goal_id}')
async def delete_goal(goal_id: int, current_user: User = Depends(get_current_user)) -> dict[str, str]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id))
        goal = result.scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Goal not found')

        await session.delete(goal)
        await session.commit()
        return {'status': 'deleted'}


@app.get('/api/settings', response_model=UserSettings)
async def get_settings_route(current_user: User = Depends(get_current_user)) -> UserSettings:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
        settings_row = result.scalar_one_or_none()
        if not settings_row:
            settings_row = UserSettings(user_id=current_user.id, theme='classic', language='pl', notifications_enabled=True)
            session.add(settings_row)
            await session.commit()
            await session.refresh(settings_row)
        return settings_row


@app.put('/api/settings', response_model=UserSettings)
async def update_settings(payload: UserSettingsCreate, current_user: User = Depends(get_current_user)) -> UserSettings:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
        settings_row = result.scalar_one_or_none()
        if not settings_row:
            settings_row = UserSettings(user_id=current_user.id)
            session.add(settings_row)

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(settings_row, field, value)

        await session.commit()
        await session.refresh(settings_row)
        return settings_row
