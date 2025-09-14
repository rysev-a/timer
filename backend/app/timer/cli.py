import click
from click import Group
from faker import Faker
from litestar.plugins import CLIPluginProtocol
import yaml


from lab.core.cli import coro
from lab.core.database import session_maker
from .models import RaceModel, AthleteModel, LapModel, RaceAthleteModel  # noqa

from .repositories import RaceRepository, AthleteRepository

fake = Faker()
import os


class TimerLoader:
    def __init__(self, session):
        self.session = session
        self.race_repository = RaceRepository(session=self.session)
        self.athlete_repository = AthleteRepository(session=self.session)

    async def clear(self):
        await self.race_repository.delete_where(auto_commit=True)
        await self.athlete_repository.delete_where(auto_commit=True)

    async def load(self):
        fixtures_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "./fixtures/races.yaml"
        )

        with open(fixtures_path, "r") as stream:
            data_loaded = yaml.safe_load(stream)

        await self.race_repository.add_many(
            [RaceModel(name=item.get("name")) for item in data_loaded.get("races")],
            auto_commit=True,
        )

        await self.athlete_repository.add_many(
            [
                AthleteModel(name=item.get("name"))
                for item in data_loaded.get("athletes")
            ],
            auto_commit=True,
        )

        click.secho("Success loaded data", fg="green")

    async def reset(self):
        await self.clear()
        await self.load()


class TimerCLIPlugin(CLIPluginProtocol):
    def on_cli_init(self, cli: Group) -> None:
        @cli.group(help="Manage RaceRepository, load data with ``load`` command")
        @click.version_option(prog_name="mycli")
        def timer(): ...

        @timer.command(help="load races data")
        @coro
        async def load():
            async with session_maker() as session:
                loader = TimerLoader(session)
                await loader.load()

        @timer.command(help="clear races data")
        @coro
        async def clear():
            async with session_maker() as session:
                loader = TimerLoader(session)
                await loader.clear()

        @timer.command(help="reset races data")
        @coro
        async def reset():
            async with session_maker() as session:
                loader = TimerLoader(session)
                await loader.reset()
