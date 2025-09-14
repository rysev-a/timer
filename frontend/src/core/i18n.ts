import i18n from "i18next";
import loginForm from "@/core/locale/ru/loginForm";
import navMenu from "@/core/locale/ru/navMenu";
import pagination from "@/core/locale/ru/pagination";
import permissionList from "@/core/locale/ru/permissionList";
import projectCreate from "@/core/locale/ru/projects/projectCreate";
import projectDetail from "@/core/locale/ru/projects/projectDetail";
import raceDetail from "@/core/locale/ru/races/raceDetail";
import raceList from "@/core/locale/ru/races/raceList";
import resetPasswordForm from "@/core/locale/ru/resetPasswordForm";
import roleCreate from "@/core/locale/ru/roles/roleCreate";
import roleDetail from "@/core/locale/ru/roles/roleDetail";
import roleList from "@/core/locale/ru/roles/roleList";
import startResetPasswordForm from "@/core/locale/ru/startResetPasswordForm";
import userCreate from "@/core/locale/ru/users/userCreate";
import userDetail from "@/core/locale/ru/users/userDetail";
import userList from "@/core/locale/ru/users/userList";
import projectList from "./locale/ru/projects/projectList";

i18n.init({
  lng: "ru", // if you're using a language detector, do not define the lng option
  resources: {
    en: {
      translation: {
        joinToProject: "Join to project",
        userList: {
          filterByEmail: "Filter by email",
          userActive: "is user active",
          userEnabled: "is user enabled",
        },
      },
    },
    ru: {
      translation: {
        loginForm,
        startResetPasswordForm,
        resetPasswordForm,
        navMenu,
        pagination,
        projectList,
        projectCreate,
        projectDetail,
        buttons: {
          save: "Сохранить",
          saveAndEdit: "Сохранить и редактировать",
        },
        joinToProject: "Присоединиться к проекту",
        userList,
        roleList,
        roleDetail,
        roleCreate,

        raceList,
        raceDetail,

        permissionList,
        userDetail,
        userCreate,
        multiSelect: {
          clearAllMessage: "Очистить всё",
        },
        navUser: {
          logout: "Выйти из системы",
          profile: "Профиль",
          notifications: "Уведомления",
        },
      },
    },
  },
});

export default i18n;
