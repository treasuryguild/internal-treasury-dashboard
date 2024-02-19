import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useMyVariable } from '../context/MyVariableContext';
import axios from 'axios';
import { fetchExcelData, filterBySubGroup, extractGroupNames, processData } from '../utils/fetchExcelData';
import { getOrgs } from '../utils/getOrgs';
import { getAssetList } from '../utils/getAssetList'
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const { myVariable, setMyVariable } = useMyVariable();
  const [assetLists, setAssetLists] = useState<any[]>([]);

  async function getAssetsForSelectedGroups(excludedGroupNames: string[]) {
    // Fetch all group information
    const allGroupInfo = await getOrgs();
    //console.log("All group info", allGroupInfo);
    // Filter groups to exclude the ones based on the provided array of group names
    const selectedGroups = allGroupInfo.filter(group =>
      !excludedGroupNames.includes(group.group_name)
    );

    // Iterate over selected groups and their projects to fetch asset lists
    const assetLists = await Promise.all(selectedGroups.flatMap(group =>
      group.projects.map(async (project: any) => {
        //console.log("Project wallets", project.wallet);
        const assets = await getAssetList(project.wallet);
        return {
          groupName: group.group_name,
          projectName: project.project_name,
          assets,
        };
      })
    ));

    return assetLists;
  }

  async function getProjects() {
    const excludedGroupNames = ['Lead Generators', 
    'Swarm', 
    'Ambassadors Guild', 
    'Catalyst Circle', 
    'Fluid 7', 
    'Community Governance Oversight', 
    'European Cardano Community', 
    'Treasury Guild',
    'Middle East Town Hall',
    'Catalyst Training and Automation',
    'Governance Guild',
    'Automate Workgroup',
    'Edify',
    'Swarm',
    'NFT-Guild',
    ]; 
    getAssetsForSelectedGroups(excludedGroupNames).then(assetlists => {
      //console.log(assetlists);
      setAssetLists(assetlists);
      // Optionally update your state or context with the fetched data
      // setMyVariable({ ...myVariable, assetLists });
    });
    let unrewardedTasks = await fetchExcelData();
    console.log("unrewarded tasks", unrewardedTasks);
  }

  useEffect(() => {
    getProjects();
  }, []);

  function prepareTableData(assetLists: any) {
    // Identify all unique tokens
    let allTokens = new Set(["ADA", "AGIX"]); // Starting with ADA and AGIX
    assetLists.forEach((group: any) => {
      group.assets.forEach((asset: any) => {
        allTokens.add(asset.displayname);
      });
    });
  
    // Prepare data for rendering
    const tableData = assetLists.map((group: any) => {
      const projectData: any = { Project: group.projectName, ADA: "0.00", AGIX: "0.00" };
      // Fill in the token amounts for this project
      group.assets.forEach((asset: any) => {
        projectData[asset.displayname] = parseFloat(asset.amount).toFixed(2);
      });
      // Fill in "0.00" for missing tokens for this project
      allTokens.forEach(token => {
        if (!projectData[token]) {
          projectData[token] = "0.00";
        }
      });
      return projectData;
    });
  
    return { tableData, allTokens: Array.from(allTokens) };
  }  

  const { tableData, allTokens } = prepareTableData(assetLists);

  return (
    <div>
      <h1>Home</h1>
      {assetLists.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thProject}>Project</th>
              {allTokens.map(token => (
                <th key={token} className={styles.thToken}>{token}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row: any, index: any) => (
              <tr key={index}>
                <td className={styles.tdProject}>{row.Project}</td>
                {allTokens.map(token => (
                  <td key={token} className={styles.tdToken}>{row[token]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading assets...</p>
      )}
    </div>
  );
};

export default Home;