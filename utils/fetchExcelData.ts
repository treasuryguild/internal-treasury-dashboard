import axios from 'axios';

// Assuming the structure of your data, you might need to adjust the types.
type Row = { values: any[] };
type Data = { [key: string]: any };

export const processData = (data: Row[]): Data[] => {
  const headers = data[1].values;

  return data.slice(2).map((row) => {
    const obj: Data = {};
    headers.forEach((header, index) => {
      if (header !== null) {
        obj[header] = row.values[index];
      }
    });
    return obj;
  });
};

export const extractGroupNames = (data: Data[]): { groupNames: string[]; subGroups: string[] } => {
  const groupNames = new Set<string>();
  const subGroups = new Set<string>();

  data.forEach((item) => {
    if (item['Group Name']) {
      groupNames.add(item['Group Name']);
    }
    if (item['Sub Group']) {
      subGroups.add(item['Sub Group']);
    }
  });

  return {
    groupNames: Array.from(groupNames),
    subGroups: Array.from(subGroups),
  };
};

export const filterBySubGroup = (data: Data[], subGroupName: string): Data[] => {
  return data.filter((item) => item['Sub Group'] === subGroupName);
};

export const filterDataBySubGroupsAndRewardedStatus = (data: Data[], allSubGroups: string[], rewardedStatus: boolean): { [key: string]: Data[] } => {
  const result: { [key: string]: Data[] } = {};

  // Ensure all subgroups are included in the result with an initial empty array
  allSubGroups.forEach(subGroup => {
    // Filter data by subgroup
    const subgroupData = filterBySubGroup(data, subGroup);
    // Then filter the subgroup data by the rewarded status
    const filteredData = subgroupData.filter(item => item['Rewarded'] === rewardedStatus);
    result[subGroup] = filteredData;
  });

  return result;
};

export const fetchExcelData = async (): Promise<{ [key: string]: Data[] }>  => {
  let results = {};
  try {
    const response = await axios.get('https://treasury-apis.netlify.app/api/read-excel');
    const processedData = processData(response.data.data);
    // Exclude entries with the group name "Swarm"
    const dataExcludingSwarm = processedData.filter(item => item['Group Name'] !== "Swarm");
    // Extract all subgroups
    const allSubGroupsInfo = extractGroupNames(dataExcludingSwarm);
    const allSubGroups = allSubGroupsInfo.subGroups;

    // Filter data by subgroups and rewarded status, ensuring all subgroups are represented
    const filteredDataBySubGroup = filterDataBySubGroupsAndRewardedStatus(dataExcludingSwarm, allSubGroups, false);
    results = filteredDataBySubGroup;
    //console.log('Filtered Data by Sub Group:', filteredDataBySubGroup);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
  return results;
};
