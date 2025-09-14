from .race_controller import RaceController
from .athlete_controller import AthleteController
from .race_athlete_controller import RaceAthleteController
from .lap_controller import LapController

from litestar import Router


timer_router = Router(
    path="/api/timer",
    route_handlers=[
        RaceController,
        AthleteController,
        RaceAthleteController,
        LapController,
    ],
)
