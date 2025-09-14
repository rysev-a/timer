from litestar import Router

from .e2e_controller import E2EController

e2e_router = Router(path="/api/e2e", route_handlers=[E2EController])
