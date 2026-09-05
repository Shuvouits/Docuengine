import React from "react";
import HeroSection from "../../component/frontend/home/HeroSection";
import ProductOverview from "../../component/frontend/home/ProductOverview";
import ConnectedWorkspace from "../../component/frontend/home/ConnectedWorkspace";
import CompanyWorkspace from "../../component/frontend/home/CompanyWorkspace";
import ConnectedWorkspaceSection from "../../component/frontend/home/ConnectedWorkspaceSection";
import KnowledgeBaseSection from "../../component/frontend/home/KnowledgeBaseSection";

const HomePage = () => {
    return (
       <>

         <HeroSection />
         <ProductOverview />
        <ConnectedWorkspace />
        <CompanyWorkspace />
        <ConnectedWorkspaceSection />
        <KnowledgeBaseSection />
       
       </>
    );
};

export default HomePage;