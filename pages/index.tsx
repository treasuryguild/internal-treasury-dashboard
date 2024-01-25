import type { NextPage } from "next";
import { useMyVariable } from '../context/MyVariableContext';




const Home: NextPage = () => {
  const { myVariable, setMyVariable } = useMyVariable();

  return (
    <div>
      <div>
        Home
      </div>
    </div>
  );
};

export default Home;
