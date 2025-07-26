import { useContext } from "react";
import { AuthContext } from '../context/AuthContext';

export default function DashboardPage() {

  const {logout} = useContext(AuthContext);

  return(
    <div>
      <h1>Dasboard page</h1>
      <button
        onClick={logout}
        className="px-4 py-2 mt-4 font-bold text-white bg-red-500 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}