from litestar.connection import ASGIConnection
from litestar.exceptions import PermissionDeniedException
from litestar.handlers.base import BaseRouteHandler
from app.serm.services.project_service import provide_project_service

from lab.core.database import sqlalchemy_config


async def is_project_owner(
    connection: ASGIConnection, handler: BaseRouteHandler
) -> None:
    if "admin" not in {item.get("name") for item in connection.user.get("roles")}:
        service = await provide_project_service(
            sqlalchemy_config.provide_session(connection.app.state, connection.scope)
        )
        project = await service.get(connection.path_params.get("item_id"))
        if str(project.user_id) != connection.user.get("id"):
            raise PermissionDeniedException("only admins can access this api")
