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

export const fetchExcelData = async (): Promise<void> => {
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
