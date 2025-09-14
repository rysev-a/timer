from typing import Callable, List

from litestar.connection import ASGIConnection
from litestar.exceptions import NotAuthorizedException
from litestar.handlers.base import BaseRouteHandler


def is_admin_guard(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    user_roles = [item.get("name") for item in connection.user.get("roles")]
    if "admin" not in user_roles:
        raise NotAuthorizedException("only admins can access this api")


def is_user_roles(roles: List[str]) -> Callable:
    def roles_guard(connection: ASGIConnection, _: BaseRouteHandler) -> None:
        if not set(roles).intersection(
            {item.get("name") for item in connection.user.get("roles")}
        ):
            raise NotAuthorizedException(f"only {', '.join(roles)} can access this api")

    return roles_guard
