import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useMyVariable } from '../context/MyVariableContext';
import { fetchExcelData } from '../utils/fetchExcelData';
import { getOrgs } from '../utils/getOrgs';
import { getAssetList } from '../utils/getAssetList'
import styles from "../styles/Home.module.css";

interface ProjectUnrewardedTasksCount {
  projectName: string;
  unrewardedTasksCount: number;
  unrewardedTasksCountIncludingNullWallets: number;
}

const Home: NextPage = () => {
  const { myVariable, setMyVariable } = useMyVariable();
  const [assetLists, setAssetLists] = useState<any[]>([]);
  const [unrewardedTasks, setUnrewardedTasks] = useState({});
  const [projectUnrewardedTasksCount, setProjectUnrewardedTasksCount] = useState<ProjectUnrewardedTasksCount[]>([]);

  const excludedProjectNames = ['Snet Archive Workgroup'];

  async function getAssetsForSelectedGroups(excludedGroupNames: string[]) {
    const allGroupInfo = await getOrgs();
    const selectedGroups = allGroupInfo.filter(group =>
      !excludedGroupNames.includes(group.group_name)
    );
  
    const assetLists = await Promise.all(selectedGroups.flatMap(group =>
      group.projects
        .filter((project: any) => !excludedProjectNames.includes(project.project_name)) // Filter out excluded projects
        .map(async (project: any) => {
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

  const subGroupToProjectMapping = [
    { projectName: 'SNET Governance Workgroup', subGroups: ['Governance Workgroup'] },
    { projectName: 'The HIVE SNet', subGroups: ['Deep Funding', 'Deep Funding Town Hall', 'The Hive'] },
    { projectName: 'DF Academy', subGroups: ['Deep Funding Academy'] },
    // Add more mappings as needed
  ];

  useEffect(() => {
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
    });
    const fetchedUnrewardedTasks = await fetchExcelData();
    //console.log("Fetched unrewarded tasks", fetchedUnrewardedTasks);
    setUnrewardedTasks(fetchedUnrewardedTasks);
  
    const tempProjectUnrewardedTasksCount: ProjectUnrewardedTasksCount[] = subGroupToProjectMapping.map(mapping => {
      let countExcludingNullWallets = 0;
      let countIncludingNullWallets = 0;
    
      mapping.subGroups.forEach(subGroup => {
        const tasks = fetchedUnrewardedTasks[subGroup];
        if (Array.isArray(tasks)) {
          countExcludingNullWallets += tasks.filter(task => !task.Rewarded && task.WalletAddress).length;
          countIncludingNullWallets += tasks.filter(task => !task.Rewarded).length;
        }
      });
    
      return {
        projectName: mapping.projectName,
        unrewardedTasksCount: countExcludingNullWallets,
        unrewardedTasksCountIncludingNullWallets: countIncludingNullWallets
      };
    });    
  
    setProjectUnrewardedTasksCount(tempProjectUnrewardedTasksCount);
  }

    getProjects();
  }, []);

  useEffect(() => {
    //console.log("projectUnrewardedTasksCount updated", projectUnrewardedTasksCount, assetLists);
  }, [projectUnrewardedTasksCount]);

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
      const projectData: any = { Project: group.projectName, ADA: "0.00", AGIX: "0.00", UnrewardedTasks: "0", UnrewardedTasksIncludingNullWallets: "0" };
  
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
  
      const projectCounts = projectUnrewardedTasksCount.find((item: any) => item.projectName === group.projectName);
    if (projectCounts) {
      projectData.UnrewardedTasks = projectCounts.unrewardedTasksCount.toString();
      projectData.UnrewardedTasksIncludingNullWallets = projectCounts.unrewardedTasksCountIncludingNullWallets.toString();
    }

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
              <th className={styles.thUnrewardedTasks}>Unrewarded Tasks (Excl. Null Wallets)</th>
              <th className={styles.thUnrewardedTasks}>Unrewarded Tasks (Incl. Null Wallets)</th> 
            </tr>
          </thead>
          <tbody>
            {tableData.map((row: any, index: any) => (
              <tr key={index}>
                <td className={styles.tdProject}>{row.Project}</td>
                {allTokens.map(token => (
                  <td key={token} className={styles.tdToken}>{row[token]}</td>
                ))}
                <td className={styles.tdUnrewardedTasks}>{row.UnrewardedTasks}</td>
                <td className={styles.tdUnrewardedTasks}>{row.UnrewardedTasksIncludingNullWallets}</td> 
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