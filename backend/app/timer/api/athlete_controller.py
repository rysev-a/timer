from typing import Annotated, Optional
from uuid import UUID

from advanced_alchemy.extensions.litestar.dto import SQLAlchemyDTO
from advanced_alchemy.extensions.litestar.providers import (
    FilterConfig,
    create_service_dependencies,
)
from advanced_alchemy.filters import FilterTypes
from advanced_alchemy.service import OffsetPagination
from litestar import get, delete, patch, post
from litestar.controller import Controller
from litestar.dto import DTOConfig
from litestar.params import Dependency
import msgspec


from ..models import AthleteModel

from ..services import AthleteService


class CreateAthleteRequest(msgspec.Struct, omit_defaults=True):
    name: str


class PatchAthleteRequest(msgspec.Struct, omit_defaults=True):
    name: Optional[str] = None


class AthleteDTO(SQLAlchemyDTO[AthleteModel]):
    config = DTOConfig(
        max_nested_depth=1,
    )


class AthleteController(Controller):
    path = "/athletes/"
    # guards = [is_user_roles(["admin"])]

    dependencies = {
        **create_service_dependencies(
            AthleteService,
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

    return_dto = AthleteDTO

    @get(operation_id="ListAthletes", path="/", exclude_from_auth=True)
    async def list_item(
        self,
        service: AthleteService,
        filters: Annotated[list[FilterTypes], Dependency(skip_validation=True)],
    ) -> OffsetPagination[AthleteModel]:
        results, total = await service.list_and_count(*filters)
        return service.to_schema(data=results, total=total, filters=filters)

    @get(operation_id="GetAthlete", path="/{item_id:uuid}", exclude_from_auth=True)
    async def get_item(
        self,
        item_id: UUID,
        service: AthleteService,
    ) -> AthleteModel:
        print(item_id)
        return await service.get(item_id)

    @delete(
        operation_id="DeleteAthlete",
        path="/{item_id:uuid}",
    )
    async def delete_item(
        self,
        item_id: UUID,
        service: AthleteService,
    ) -> None:
        await service.delete(item_id)

    @patch(
        operation_id="PatchAthlete",
        path="/{item_id:uuid}",
    )
    async def patch_item(
        self,
        item_id: UUID,
        data: PatchAthleteRequest,
        service: AthleteService,
    ) -> AthleteModel:
        data = msgspec.to_builtins(data)
        return await service.update(AthleteModel(id=item_id, **data), auto_commit=True)

    @post(operation_id="CreateAthlete", path="/")
    async def create_item(
        self, data: CreateAthleteRequest, service: AthleteService
    ) -> AthleteModel:
        return await service.create(AthleteModel(name=data.name))
