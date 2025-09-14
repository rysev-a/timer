from dataclasses import dataclass
from typing import Annotated, List, Optional
from uuid import UUID, uuid4

from advanced_alchemy.extensions.litestar.dto import SQLAlchemyDTO
from advanced_alchemy.extensions.litestar.providers import (
    FilterConfig,
    create_service_dependencies,
)
from advanced_alchemy.filters import FilterTypes
from advanced_alchemy.service import OffsetPagination
from litestar import delete, get, patch, post
from litestar.controller import Controller
from litestar.di import Provide
from litestar.dto import DataclassDTO, DTOConfig
from litestar.exceptions import HTTPException
from litestar.params import Dependency
from litestar.status_codes import HTTP_409_CONFLICT
import msgspec

from ..auth_events import provide_emit_event
from ..models import UserModel
from ..permissions import is_user_roles
from ..services import AuthService, UserService, provide_auth_service


@dataclass
class UserData:
    id: UUID
    email: str
    is_enabled: bool
    is_active: bool
    password: str


@dataclass
class UserRolePatchData:
    id: str
    name: str


@dataclass
class UserRoleCreateData(UserRolePatchData): ...


class UserCreateData(msgspec.Struct):
    email: str
    roles: Optional[List[UserRolePatchData]] = None


class UserPatchData(msgspec.Struct, omit_defaults=True):
    email: Optional[str] = None
    password: Optional[str] = None
    is_enabled: Optional[bool] = None
    is_active: Optional[bool] = None
    roles: Optional[List[UserRolePatchData]] = None


class ResetUserPasswordResponse(msgspec.Struct):
    message: str


class PatchUserDTO(DataclassDTO[UserPatchData]):
    config = DTOConfig(exclude={"id"}, partial=True)


class UserDTO(SQLAlchemyDTO[UserModel]):
    config = DTOConfig(
        exclude={
            "password",
            "created_at",
            "updated_at",
            "roles.0.created_at",
            "roles.0.updated_at",
        },
        max_nested_depth=1,
    )


class UserController(Controller):
    guards = [is_user_roles(["admin", "moderator"])]

    dependencies = {
        "emit_event": Provide(provide_emit_event),
        "auth_service": Provide(provide_auth_service),
        **create_service_dependencies(
            UserService,
            key="users_service",
            load=[UserModel.roles],
            filters=FilterConfig(
                id_filter=UUID,
                created_at=True,
                updated_at=True,
                pagination_type="limit_offset",
                search="email",
            ),
        ),
    }

    return_dto = UserDTO

    @get(operation_id="ListUsers", path="/users")
    async def list_users(
        self,
        users_service: UserService,
        filters: Annotated[list[FilterTypes], Dependency(skip_validation=True)],
    ) -> OffsetPagination[UserModel]:
        results, total = await users_service.list_and_count(*filters)
        return users_service.to_schema(data=results, total=total, filters=filters)

    @delete(
        operation_id="RemoveUser",
        path="/users/{user_id:str}",
        guards=[is_user_roles(["admin"])],
    )
    async def remove_user(self, users_service: UserService, user_id: UUID) -> None:
        await users_service.delete(user_id, auto_commit=True)
        return None

    @get(operation_id="GetUser", path="/users/{user_id:str}")
    async def get_user(self, user_id: UUID, users_service: UserService) -> UserModel:
        return await users_service.get(user_id)

    @patch(operation_id="UpdateUser", path="/users/{user_id:str}")
    async def update_user(
        self,
        user_id: UUID,
        users_service: UserService,
        auth_service: AuthService,
        data: UserPatchData,
    ) -> UserModel:
        user = await users_service.get(user_id)
        data = msgspec.to_builtins(data)

        if data.get("roles") is not None:
            roles = data.pop("roles")
            await auth_service.update_user_roles(user_id, roles)

        await users_service.update(UserModel(id=user_id, **data), auto_commit=True)
        return users_service.to_schema(data=user)

    @post(operation_id="ResetUserPassword", path="/users/{user_id:str}/reset-password")
    async def reset_user_password(
        self, user_id: UUID, users_service: UserService, auth_service: AuthService
    ) -> ResetUserPasswordResponse:
        user = await users_service.get(user_id)
        await auth_service.start_reset_password(user.email)
        return ResetUserPasswordResponse(message="success")

    @post(operation_id="CreateUser", path="/users")
    async def create_user(
        self,
        data: UserCreateData,
        users_service: UserService,
        auth_service: AuthService,
    ) -> UserModel:
        if await users_service.get_one_or_none(UserModel.email == data.email):
            raise HTTPException(
                status_code=HTTP_409_CONFLICT,
                detail="User with input already exists",
            )

        user = await users_service.create(
            UserModel(
                email=data.email,
                password=str(uuid4()),
            )
        )

        data = msgspec.to_builtins(data)

        if data.get("roles") is not None:
            roles = data.pop("roles")
            await auth_service.update_user_roles(user.id, roles)

        await auth_service.start_reset_password(user.email)

        await auth_service.repository.session.refresh(user)
        return user
