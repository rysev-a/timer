import advanced_alchemy
from litestar import get, post
from litestar.controller import Controller
from litestar.exceptions import HTTPException
from litestar.status_codes import HTTP_404_NOT_FOUND
from msgspec import Struct
from sqlalchemy.ext.asyncio import AsyncSession

from app.timer.cli import TimerLoader
from lab.auth.auth_cli import AuthLoader
from lab.auth.models import AuthCodeModel, UserModel
from lab.auth.repositories import (
    AuthCodeRepository,
    UserRepository,
    provide_auth_code_repository,
    provide_user_repository,
)

from .permissions import is_debug_guard


class MessageResponse(Struct):
    message: str


class UserAuthCodeResponse(Struct):
    code: str


class E2EController(Controller):
    path = "/api/e2e"

    dependencies = {
        "user_repository": provide_user_repository,
        "auth_code_repository": provide_auth_code_repository,
    }
    guards = [is_debug_guard]

    @get(path="/activate-code/{email: str}", exclude_from_auth=True)
    async def activate_code(
        self,
        email: str,
        auth_code_repository: AuthCodeRepository,
        user_repository: UserRepository,
    ) -> UserAuthCodeResponse:
        try:
            user = await user_repository.get_one(UserModel.email == email)
        except advanced_alchemy.exceptions.NotFoundError:
            raise HTTPException("Email not found", status_code=HTTP_404_NOT_FOUND)

        try:
            activate = await auth_code_repository.get_one(
                AuthCodeModel.user_id == user.id
            )
        except advanced_alchemy.exceptions.NotFoundError:
            raise HTTPException("Code not found", status_code=HTTP_404_NOT_FOUND)

        return UserAuthCodeResponse(code=activate.code)

    @post(path="/reset", exclude_from_auth=True)
    async def reset(self, db_session: AsyncSession) -> MessageResponse:
        auth_loader = AuthLoader(db_session)
        timer_loader = TimerLoader(db_session)

        await timer_loader.clear()
        await auth_loader.reset()
        await timer_loader.load()

        return MessageResponse(message="success")
