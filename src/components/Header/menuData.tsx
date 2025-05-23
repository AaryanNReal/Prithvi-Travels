import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
    isbutton:false
  },
  {
    id: 2,
    title: "Tours",
    newTab: false,
    isbutton:false,
    submenu: [
      {
        id: 21,
        title: "Tour List",
        path: "/tours",
        newTab: false,
        isbutton:false,
      },
      {
        id: 22,
        title: "International Destinations",
        path: "/tours/international",
        newTab: false,
        isbutton:false,
      },
      {
        id: 23,
        title: "Domestic Destinations",
        path: "/tours/domestic",
        newTab: false,
        isbutton:false,
      },
    ],
  },
  {
    id: 3,
    title: "Visa Expert",
    path:"/visa-expert",
    newTab: false,
    isbutton:false,
    
    
  },
  {
    id: 4,
    title: "Cruises",
    newTab: false,
   path:'/cruises',
   isbutton:false,
  },
  {
    id: 5,
    title: "Blogs",
    path: "/blog",
    newTab: false,
    isbutton:false,
  },
  {
    id: 6,
    title: "Contact Us",
    path: "/contact",
    newTab: false,
    isbutton:false,
  },
  {
    id: 7,
    title: " About Us",
    path: "/about",
    newTab: false,
    isbutton:false,

  },

  {
    id: 8,
    title: "Custom Itenary + ",
    path: "#",
    newTab: false,
    isbutton:true,
    onClick: "openItineraryModal"
    
    
  }
  
];

export default menuData;