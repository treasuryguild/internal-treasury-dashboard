import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useMyVariable } from '../context/MyVariableContext';
import axios from 'axios';

const fetchExcelData = async () => {
  try {
    const response = await axios.get('https://treasury-apis.netlify.app/api/read-excel');
    console.log(response.data); // Process your data here
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const Home: NextPage = () => {
  const { myVariable, setMyVariable } = useMyVariable();

  useEffect(() => {
    fetchExcelData();
  }, []);

  return (
    <div>
      <div>
        Home
      </div>
    </div>
  );
};

export default Home;
