from litestar import Litestar
from litestar.testing import AsyncTestClient

from ..models import UserModel
from ..services import AuthCodeService, RoleService, UserService


async def test_get_users(
    test_client: AsyncTestClient[Litestar],
    user_service: UserService,
    auth_fixtures,
    admin_headers,
) -> None:
    response = await test_client.get("/api/auth/users", headers=admin_headers)
    response_data = response.json()
    assert len(response_data["items"]) == 7
    assert response_data["total"] == 7


async def test_activate_user(
    test_client: AsyncTestClient[Litestar],
    user_service: UserService,
    auth_fixtures,
    admin_headers,
):
    customer = await user_service.repository.get_one(
        UserModel.email == "customer@mail.com"
    )
    await test_client.patch(
        f"/api/auth/users/{customer.id}",
        headers=admin_headers,
        json={"is_active": True},
    )

    await user_service.repository.session.refresh(customer)
    assert customer.is_active == True


async def test_create_user(
    test_client: AsyncTestClient[Litestar],
    user_service: UserService,
    role_service: RoleService,
    auth_fixtures,
    admin_headers,
):
    roles = await role_service.repository.list()

    response = await test_client.post(
        "/api/auth/users",
        headers=admin_headers,
        json={
            "email": "newuser@mail.com",
            "roles": [{"id": str(role.id), "name": role.name} for role in roles],
        },
    )

    assert response.json().get("email") == "newuser@mail.com"
    assert {role.get("name") for role in response.json().get("roles")} == {
        role.name for role in roles
    }


async def test_reset_user_password(
    test_client: AsyncTestClient[Litestar],
    user_service: UserService,
    role_service: RoleService,
    auth_code_service: AuthCodeService,
    auth_fixtures,
    admin_headers,
):
    user = await user_service.get_one(UserModel.email == "customer@mail.com")
    await test_client.post(
        f"/api/auth/users/{user.id}/reset-password",
        headers=admin_headers,
    )

    user_with_reset_codes = (
        code.user_id for code in await auth_code_service.repository.list()
    )
    assert user.id in user_with_reset_codes
