import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useMyVariable } from '../context/MyVariableContext';
import axios from 'axios';

const processData = (data: any) => {
  const headers = data[1].values;

  const result = data.slice(2).map((row: any) => {
    const obj: any = {};
    headers.forEach((header: any, index: any) => {
      // Skip the null key
      if (header !== null) {
        obj[header] = row.values[index];
      }
    });
    return obj;
  });

  return result;
};

const extractGroupNames = (data: any) => {
  const groupNames = new Set();
  const subGroups = new Set();

  data.forEach((item: any) => {
    if (item['Group Name']) {
      groupNames.add(item['Group Name']);
    }
    if (item['Sub Group']) {
      subGroups.add(item['Sub Group']);
    }
  });

  return {
    groupNames: Array.from(groupNames),
    subGroups: Array.from(subGroups)
  };
};

const filterBySubGroup = (data: any, subGroupName: any) => {
  return data.filter((item: any) => item['Sub Group'] === subGroupName);
};

const fetchExcelData = async () => {
  try {
    const response = await axios.get('https://treasury-apis.netlify.app/api/read-excel');
    const processedData = processData(response.data.data);
    const groupsInfo = extractGroupNames(processedData);
      console.log('Group Names:', groupsInfo.groupNames);
      console.log('Sub Groups:', groupsInfo.subGroups);
    const filteredData = filterBySubGroup(processedData, 'Deep Funding Academy');
      console.log('Filtered Data:', filteredData);
    console.log(response.data, processedData); // Process your data here
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
