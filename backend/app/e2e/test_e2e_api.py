from litestar import Litestar
from litestar.testing import AsyncTestClient

from lab.auth.services import AuthService, RegisterRequest, UserService


async def test_reset_api(test_client: AsyncTestClient[Litestar], user_service: UserService, auth_fixtures) -> None:
    ids = {user.id for user in await user_service.repository.list()}
    await test_client.post("/api/e2e/reset")
    next_ids = {user.id for user in await user_service.repository.list()}
    assert ids & next_ids == set()


async def test_get_auth_code_by_email(
    test_client: AsyncTestClient[Litestar], auth_service: AuthService, user_service: UserService, auth_fixtures
) -> None:
    register_user = await auth_service.register(RegisterRequest(email="newuser@mail.com", password="password"))

    response = await test_client.get("/api/e2e/activate-code/newuser@mail.com")
    assert response.json().get("code") == auth_service.auth_code.code

    # teardown
    await user_service.repository.delete(register_user.id)
