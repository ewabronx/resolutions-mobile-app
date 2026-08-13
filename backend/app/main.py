from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.models import Category as CategoryModel, Goal as GoalModel, Profile as ProfileModel, User as UserModel, UserSettings as UserSettingsModel
from app.schemas import (
    Category as CategorySchema,
    CategoryCreate,
    Goal as GoalSchema,
    GoalCreate,
    Profile as ProfileSchema,
    ProfileCreate,
    Token,
    UserCreate,
    UserLogin,
    UserMe,
    UserSettings as UserSettingsSchema,
    UserSettingsCreate,
)
from app.security import create_access_token, get_current_user, get_password_hash, verify_password

settings = get_settings()
app = FastAPI(title='Resolutions API', version='0.1.0')

DEFAULT_CATEGORY_DEFINITIONS = [
    {'name': 'zdrowie', 'description': 'Dbaj o równowagę ciała, snu i energii.', 'icon_name': 'HeartPulse', 'color': '#798165', 'order_index': 0},
    {'name': 'finanse', 'description': 'Buduj bezpieczeństwo finansowe krok po kroku.', 'icon_name': 'Wallet', 'color': '#798165', 'order_index': 1},
    {'name': 'praca', 'description': 'Skup się na jakości i konsekwencji.', 'icon_name': 'Briefcase', 'color': '#798165', 'order_index': 2},
    {'name': 'hobby', 'description': 'Znajdź czas na przyjemność i ciekawość.', 'icon_name': 'Palette', 'color': '#96584E', 'order_index': 3},
    {'name': 'rodzina', 'description': 'Buduj bliskość i wspólne chwile.', 'icon_name': 'Home', 'color': '#96584E', 'order_index': 4},
    {'name': 'podroze', 'description': 'Planuj nowe miejsca i doświadczenia.', 'icon_name': 'Plane', 'color': '#96584E', 'order_index': 5},
    {'name': 'edukacja', 'description': 'Rozwijaj umiejętności z cierpliwością.', 'icon_name': 'BookOpen', 'color': '#8C6046', 'order_index': 6},
    {'name': 'sport', 'description': 'Regularność jest ważniejsza niż intensywność.', 'icon_name': 'Dumbbell', 'color': '#8C6046', 'order_index': 7},
    {'name': 'kreatywnosc', 'description': 'Twórz coś każdego dnia przez chwilę.', 'icon_name': 'Sparkles', 'color': '#8C6046', 'order_index': 8},
    {'name': 'dom', 'description': 'Stwórz spokojne, uporządkowane środowisko.', 'icon_name': 'House', 'color': '#2C2725', 'order_index': 9},
    {'name': 'spolecznosc', 'description': 'Zostawiaj po sobie pozytywny ślad.', 'icon_name': 'Users', 'color': '#2C2725', 'order_index': 10},
    {'name': 'dobrostan', 'description': 'Pielęgnuj spokój i wewnętrzną równowagę.', 'icon_name': 'Leaf', 'color': '#2C2725', 'order_index': 11},
]

DEFAULT_GOAL_DEFINITIONS = {
    'zdrowie': [
        {'title': 'Spacer 20 minut dziennie', 'description': 'Wychodź na spacer i zredukuj stres.', 'is_completed': True},
    ],
    'finanse': [
        {'title': 'Odłożyć 10% pensji', 'description': 'Zaczynaj od małego, stałego oszczędzania.', 'is_completed': False},
    ],
    'praca': [
        {'title': 'Ukończyć jeden priorytet dziennie', 'description': 'Skup się na najważniejszym zadaniu.', 'is_completed': False},
    ],
    'hobby': [
        {'title': 'Czas na malowanie co tydzień', 'description': 'Poświęć jedną chwilę na kreatywność.', 'is_completed': True},
    ],
    'rodzina': [
        {'title': 'Kolacja razem w weekend', 'description': 'Spędź wspólny wieczór bez telefonów.', 'is_completed': False},
    ],
    'podroze': [
        {'title': 'Zapisać 3 miejsca do odwiedzenia', 'description': 'Zbieraj inspiracje na przyszłe wyjazdy.', 'is_completed': False},
    ],
    'edukacja': [
        {'title': 'Czytać 20 stron tygodniowo', 'description': 'Rozwijaj pasję i wiedzę.', 'is_completed': True},
    ],
    'sport': [
        {'title': 'Trening 3 razy w tygodniu', 'description': 'Regularność jest kluczem do energii.', 'is_completed': False},
    ],
    'kreatywnosc': [
        {'title': 'Napisanie 10 zdań dziennie', 'description': 'Twórz małe, regularne kroki.', 'is_completed': False},
    ],
    'dom': [
        {'title': 'Posprzątać stół wieczorem', 'description': 'Zadbaj o porządek codziennie.', 'is_completed': True},
    ],
    'spolecznosc': [
        {'title': 'Pomoc w jednej inicjatywie', 'description': 'Wspieraj innych i buduj relacje.', 'is_completed': False},
    ],
    'dobrostan': [
        {'title': 'Minuta medytacji rano', 'description': 'Zacznij dzień od spokoju.', 'is_completed': True},
    ],
}


async def seed_default_categories_for_user(session: AsyncSession, user_id: int) -> list[CategoryModel]:
    legacy_name_map = {
        'health': 'zdrowie',
        'finance': 'finanse',
        'work': 'praca',
        'family': 'rodzina',
        'travel': 'podroze',
        'education': 'edukacja',
        'home': 'dom',
        'community': 'spolecznosc',
        'wellbeing': 'dobrostan',
        'creativity': 'kreatywnosc',
    }

    existing = await session.execute(select(CategoryModel).where(CategoryModel.user_id == user_id).order_by(CategoryModel.order_index.asc()))
    categories = list(existing.scalars().all())
    seen_names: set[str] = set()
    duplicate_ids: list[int] = []

    for category in categories:
        normalized = legacy_name_map.get(category.name.lower(), category.name.lower())
        if category.name.lower() != normalized:
            category.name = normalized

        if normalized in seen_names:
            duplicate_ids.append(category.id)
            continue
        seen_names.add(normalized)

    if duplicate_ids:
        for category_id in duplicate_ids:
            duplicate_category = await session.get(CategoryModel, category_id)
            if duplicate_category is not None:
                await session.delete(duplicate_category)

    categories = list((await session.execute(select(CategoryModel).where(CategoryModel.user_id == user_id).order_by(CategoryModel.order_index.asc()))).scalars().all())
    seen_names = set()
    for category in categories:
        normalized = legacy_name_map.get(category.name.lower(), category.name.lower())
        if category.name.lower() != normalized:
            category.name = normalized
        if normalized in seen_names:
            await session.delete(category)
            continue
        seen_names.add(normalized)

    categories = list((await session.execute(select(CategoryModel).where(CategoryModel.user_id == user_id).order_by(CategoryModel.order_index.asc()))).scalars().all())
    if categories:
        await session.flush()
        return categories

    seeded: list[CategoryModel] = []
    for definition in DEFAULT_CATEGORY_DEFINITIONS:
        category = CategoryModel(user_id=user_id, **definition)
        session.add(category)
        seeded.append(category)

    await session.flush()
    return seeded


async def seed_default_goals_for_user(session: AsyncSession, user_id: int) -> None:
    categories = await seed_default_categories_for_user(session, user_id)
    for category in categories:
        existing_goals = await session.execute(
            select(GoalModel).where(GoalModel.user_id == user_id, GoalModel.category_id == category.id)
        )
        existing_goal_rows = list(existing_goals.scalars().all())
        if existing_goal_rows:
            continue

        for index, goal_definition in enumerate(DEFAULT_GOAL_DEFINITIONS.get(category.name.lower(), [])):
            session.add(
                GoalModel(
                    user_id=user_id,
                    category_id=category.id,
                    title=goal_definition['title'],
                    description=goal_definition.get('description'),
                    is_completed=goal_definition.get('is_completed', False),
                    order_index=index,
                )
            )

    await session.flush()

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
        existing = await session.execute(select(UserModel).where(UserModel.email == payload.email.lower()))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')

        user = UserModel(
            email=payload.email.lower(),
            password_hash=get_password_hash(payload.password),
            full_name=payload.full_name,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        profile = ProfileModel(user_id=user.id, theme='classic')
        settings_row = UserSettingsModel(user_id=user.id, theme='classic', language='pl', notifications_enabled=True)
        session.add_all([profile, settings_row])
        await seed_default_goals_for_user(session, user.id)
        await session.commit()

        access_token = create_access_token(user.id)
        return Token(access_token=access_token)


@app.post('/api/auth/login', response_model=Token)
async def login_user(payload: UserLogin) -> Token:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserModel).where(UserModel.email == payload.email.lower()))
        user = result.scalar_one_or_none()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')

        access_token = create_access_token(user.id)
        return Token(access_token=access_token)


@app.get('/api/users/me', response_model=UserMe)
async def get_me(current_user: UserModel = Depends(get_current_user)) -> UserMe:
    return UserMe(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
    )


@app.get('/api/profiles/me', response_model=ProfileSchema)
async def get_profile(current_user: UserModel = Depends(get_current_user)) -> ProfileSchema:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(ProfileModel).where(ProfileModel.user_id == current_user.id))
        profile = result.scalar_one_or_none()
        if not profile:
            profile = ProfileModel(user_id=current_user.id, theme='classic')
            session.add(profile)
            await session.commit()
            await session.refresh(profile)

        return profile


@app.put('/api/profiles/me', response_model=ProfileSchema)
async def update_profile(payload: ProfileCreate, current_user: UserModel = Depends(get_current_user)) -> ProfileSchema:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(ProfileModel).where(ProfileModel.user_id == current_user.id))
        profile = result.scalar_one_or_none()
        if not profile:
            profile = ProfileModel(user_id=current_user.id)
            session.add(profile)

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)

        await session.commit()
        await session.refresh(profile)
        return profile


@app.get('/api/categories', response_model=list[CategorySchema])
async def list_categories(current_user: UserModel = Depends(get_current_user)) -> list[CategorySchema]:
    async with AsyncSessionLocal() as session:
        categories = await seed_default_goals_for_user(session, current_user.id) or await seed_default_categories_for_user(session, current_user.id)
        await session.commit()
        result = await session.execute(select(CategoryModel).where(CategoryModel.user_id == current_user.id).order_by(CategoryModel.order_index.asc()))
        return list(result.scalars().all())


@app.post('/api/categories', response_model=CategorySchema)
async def create_category(payload: CategoryCreate, current_user: UserModel = Depends(get_current_user)) -> CategorySchema:
    async with AsyncSessionLocal() as session:
        category = CategoryModel(user_id=current_user.id, **payload.model_dump())
        session.add(category)
        await session.commit()
        await session.refresh(category)
        return category


@app.put('/api/categories/{category_id}', response_model=CategorySchema)
async def update_category(category_id: int, payload: CategoryCreate, current_user: UserModel = Depends(get_current_user)) -> CategorySchema:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(CategoryModel).where(CategoryModel.id == category_id, CategoryModel.user_id == current_user.id))
        category = result.scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Category not found')

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(category, field, value)

        await session.commit()
        await session.refresh(category)
        return category


@app.delete('/api/categories/{category_id}')
async def delete_category(category_id: int, current_user: UserModel = Depends(get_current_user)) -> dict[str, str]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(CategoryModel).where(CategoryModel.id == category_id, CategoryModel.user_id == current_user.id))
        category = result.scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Category not found')

        await session.delete(category)
        await session.commit()
        return {'status': 'deleted'}


@app.get('/api/goals', response_model=list[GoalSchema])
async def list_goals(current_user: UserModel = Depends(get_current_user)) -> list[GoalSchema]:
    async with AsyncSessionLocal() as session:
        await seed_default_goals_for_user(session, current_user.id)
        await session.commit()
        result = await session.execute(select(GoalModel).where(GoalModel.user_id == current_user.id).order_by(GoalModel.order_index.asc()))
        return list(result.scalars().all())


@app.post('/api/goals', response_model=GoalSchema)
async def create_goal(payload: GoalCreate, current_user: UserModel = Depends(get_current_user)) -> GoalSchema:
    async with AsyncSessionLocal() as session:
        category_exists = await session.execute(
            select(CategoryModel).where(CategoryModel.id == payload.category_id, CategoryModel.user_id == current_user.id)
        )
        if not category_exists.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Category not found')

        goal = GoalModel(user_id=current_user.id, **payload.model_dump(exclude={'category_id'}), category_id=payload.category_id)
        session.add(goal)
        await session.commit()
        await session.refresh(goal)
        return goal


@app.put('/api/goals/{goal_id}', response_model=GoalSchema)
async def update_goal(goal_id: int, payload: GoalCreate, current_user: UserModel = Depends(get_current_user)) -> GoalSchema:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(GoalModel).where(GoalModel.id == goal_id, GoalModel.user_id == current_user.id))
        goal = result.scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Goal not found')

        if payload.category_id != goal.category_id:
            category_exists = await session.execute(
                select(CategoryModel).where(CategoryModel.id == payload.category_id, CategoryModel.user_id == current_user.id)
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
async def delete_goal(goal_id: int, current_user: UserModel = Depends(get_current_user)) -> dict[str, str]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(GoalModel).where(GoalModel.id == goal_id, GoalModel.user_id == current_user.id))
        goal = result.scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Goal not found')

        await session.delete(goal)
        await session.commit()
        return {'status': 'deleted'}


@app.get('/api/settings', response_model=UserSettingsSchema)
async def get_settings_route(current_user: UserModel = Depends(get_current_user)) -> UserSettingsSchema:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserSettingsModel).where(UserSettingsModel.user_id == current_user.id))
        settings_row = result.scalar_one_or_none()
        if not settings_row:
            settings_row = UserSettingsModel(user_id=current_user.id, theme='classic', language='pl', notifications_enabled=True)
            session.add(settings_row)
            await session.commit()
            await session.refresh(settings_row)
        return settings_row


@app.put('/api/settings', response_model=UserSettingsSchema)
async def update_settings(payload: UserSettingsCreate, current_user: UserModel = Depends(get_current_user)) -> UserSettingsSchema:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserSettingsModel).where(UserSettingsModel.user_id == current_user.id))
        settings_row = result.scalar_one_or_none()
        if not settings_row:
            settings_row = UserSettingsModel(user_id=current_user.id)
            session.add(settings_row)

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(settings_row, field, value)

        await session.commit()
        await session.refresh(settings_row)
        return settings_row
