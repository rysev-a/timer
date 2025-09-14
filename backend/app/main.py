from litestar import Litestar
from litestar.plugins.sqlalchemy import SQLAlchemyPlugin

from app.e2e.e2e_controller import E2EController
from app.timer.api import timer_router
from app.timer.cli import TimerCLIPlugin
from lab.auth.api import auth_router
from lab.auth.auth_cli import AuthCLIPlugin
from lab.auth.auth_events import send_auth_code_handler
from lab.auth.middleware import JWTAuthenticationMiddleware
from lab.core.database import sqlalchemy_config
from lab.core.openapi import configure_open_api_config

app = Litestar(
    [auth_router, timer_router, E2EController],
    plugins=[
        SQLAlchemyPlugin(config=sqlalchemy_config),
        AuthCLIPlugin(),
        TimerCLIPlugin(),
    ],
    middleware=[JWTAuthenticationMiddleware],
    listeners=[send_auth_code_handler],
    openapi_config=configure_open_api_config("timer", "v1", "/docs"),
    debug=True,
)
