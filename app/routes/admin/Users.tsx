import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "~/utils/authUtils";
import axiosInstance from "../../config/axiosInstance";
import SideBar from "~/components/SideBar";

export default function Users() {

    return (
        <>
            <div><SideBar /></div>
        </>
    );
}
