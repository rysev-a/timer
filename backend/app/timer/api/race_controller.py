from typing import Annotated, Optional, List
from uuid import UUID

from advanced_alchemy.extensions.litestar.dto import SQLAlchemyDTO
from advanced_alchemy.extensions.litestar.providers import (
    FilterConfig,
    create_service_dependencies,
)
from advanced_alchemy.filters import FilterTypes
from advanced_alchemy.service import OffsetPagination
from litestar import get, patch, post, delete
from litestar.controller import Controller
from litestar.dto import DTOConfig
from litestar.params import Dependency
import msgspec


from ..models import RaceModel

from ..services import RaceService


class CreateRaceRequest(msgspec.Struct, omit_defaults=True):
    name: str


class RaceAthletePatchData(msgspec.Struct):
    id: str
    name: str


class PatchRaceRequest(msgspec.Struct, omit_defaults=True):
    name: Optional[str] = None
    athletes: Optional[List[RaceAthletePatchData]] = None


class UserPatchData(msgspec.Struct, omit_defaults=True):
    email: Optional[str] = None
    password: Optional[str] = None
    is_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


class RaceDTO(SQLAlchemyDTO[RaceModel]):
    config = DTOConfig(
        max_nested_depth=1,
    )


class RaceController(Controller):
    path = "/races"
    # guards = [is_user_roles(["admin"])]

    dependencies = {
        **create_service_dependencies(
            RaceService,
            key="service",
            filters=FilterConfig(
                id_filter=UUID,
                created_at=True,
                updated_at=True,
                pagination_type="limit_offset",
                search="name",
            ),
        ),
    }

    return_dto = RaceDTO

    @get(operation_id="ListRaces", path="/", exclude_from_auth=True)
    async def list_item(
        self,
        service: RaceService,
        filters: Annotated[list[FilterTypes], Dependency(skip_validation=True)],
    ) -> OffsetPagination[RaceModel]:
        results, total = await service.list_and_count(*filters)
        return service.to_schema(data=results, total=total, filters=filters)

    @get(operation_id="GetRace", path="/{item_id:uuid}", exclude_from_auth=True)
    async def get_item(
        self,
        item_id: UUID,
        service: RaceService,
    ) -> RaceModel:
        return await service.get(item_id)

    @delete(
        operation_id="DeleteRace",
        path="/{item_id:uuid}",
    )
    async def delete_item(
        self,
        item_id: UUID,
        service: RaceService,
    ) -> None:
        await service.delete(item_id)

    @patch(operation_id="UpdateRace", path="/{item_id:str}")
    async def update_user(
        self,
        item_id: UUID,
        service: RaceService,
        data: PatchRaceRequest,
    ) -> RaceModel:
        race = await service.get(item_id)

        await service.update(RaceModel(id=item_id, name=data.name))

        await service.update_race_athletes(
            item_id=item_id,
            athletes=[athlete.id for athlete in data.athletes],
        )

        return race


    @post(operation_id="CreateProject", path="/")
    async def create_item(
        self, data: CreateRaceRequest, service: RaceService
    ) -> RaceModel:


        return await service.create(
            RaceModel(
                name=data.name,

            )
        )
