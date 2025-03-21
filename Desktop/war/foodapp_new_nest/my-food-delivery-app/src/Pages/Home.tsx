import { useEffect } from "react";
import FruitsSection from "../components/FruitsSection";
import Hero from '../components/Hero'
import MenuContainer from "../components/MenuContainer";
// import { heroData } from "../utils/data";

import { useData } from "../context/DataContext";

export default function Home() {
  
  const {menuItems, fetchMenuItems} = useData();
 
  useEffect(() => {
    fetchMenuItems(); 
  }, []);
  
  return (
    <div>
       
        <Hero/>      
        <FruitsSection foodItems={menuItems}/>
        <MenuContainer/>
        
    </div>
  )
}
