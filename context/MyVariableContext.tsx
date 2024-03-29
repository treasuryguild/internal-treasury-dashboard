// /context/MyVariableContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Repo {
  repo_id: string;
  repo_name: string;
  repo_type: string;
}

interface Org {
  org_id: string;
  org_name: string;
  logo_url: string;
  repos: Repo[];
}

type MyVariable = {
  orgInfo: Org[];
  repoInfo?: any;
  groupInfo?: any;
  // other keys go here
};

interface MyVariableContextProps {
  myVariable: MyVariable;
  setMyVariable: React.Dispatch<React.SetStateAction<MyVariable>>;
}

export const MyVariableContext = createContext<MyVariableContextProps | undefined>(undefined);

interface MyVariableProviderProps {
  children: ReactNode;
}

export const MyVariableProvider: React.FC<MyVariableProviderProps> = ({ children }) => {
  const [myVariable, setMyVariable] = useState<MyVariable>({ orgInfo: [], repoInfo: undefined, groupInfo: undefined});

  return (
    <MyVariableContext.Provider value={{ myVariable, setMyVariable }}>
      {children}
    </MyVariableContext.Provider>
  );
};

export const useMyVariable = (): MyVariableContextProps => {
  const context = useContext(MyVariableContext);
  if (!context) {
    throw new Error("useMyVariable must be used within a MyVariableProvider");
  }
  return context;
}
