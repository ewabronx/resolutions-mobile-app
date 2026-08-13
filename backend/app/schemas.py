from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


class ProfileBase(BaseModel):
    bio: Optional[str] = None
    mbti_type: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: str = 'classic'


class ProfileCreate(ProfileBase):
    pass


class Profile(ProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon_name: str = 'Sparkles'
    color: str = '#798165'
    order_index: int = 0
    is_archived: bool = False


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_completed: bool = False
    order_index: int = 0
    target_date: Optional[datetime] = None


class GoalCreate(GoalBase):
    category_id: int


class Goal(GoalBase):
    id: int
    user_id: int
    category_id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class UserSettingsBase(BaseModel):
    theme: str = 'classic'
    language: str = 'pl'
    notifications_enabled: bool = True


class UserSettingsCreate(UserSettingsBase):
    pass


class UserSettings(UserSettingsBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True


class UserMe(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True
