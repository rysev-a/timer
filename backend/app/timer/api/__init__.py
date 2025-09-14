from .race_controller import RaceController
from .athlete_controller import AthleteController

from litestar import Router


timer_router = Router(
    path="/api/timer",
    route_handlers=[
        RaceController,
        AthleteController,
    ],
)
