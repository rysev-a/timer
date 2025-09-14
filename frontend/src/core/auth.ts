import { httpClient } from "@/core/api";
import { Auth, isAdmin, userRoles } from "@/package";

isAdmin.mount();
userRoles.mount();

const auth = new Auth(httpClient);

export default auth;
