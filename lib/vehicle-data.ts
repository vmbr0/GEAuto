// Liste des marques et modèles populaires pour les menus déroulants

export interface VehicleBrand {
  id: string;
  name: string;
  models: string[];
}

export const VEHICLE_BRANDS: VehicleBrand[] = [
  {
    id: "1900", // BMW
    name: "BMW",
    models: [
      "Série 1",
      "Série 2",
      "Série 3",
      "Série 4",
      "Série 5",
      "Série 6",
      "Série 7",
      "Série 8",
      "X1",
      "X2",
      "X3",
      "X4",
      "X5",
      "X6",
      "X7",
      "Z4",
      "i3",
      "i4",
      "iX",
    ],
  },
  {
    id: "3500", // Mercedes-Benz
    name: "Mercedes-Benz",
    models: [
      "Classe A",
      "Classe B",
      "Classe C",
      "Classe E",
      "Classe S",
      "GLA",
      "GLB",
      "GLC",
      "GLE",
      "GLS",
      "G-Class",
      "SL",
      "AMG GT",
    ],
  },
  {
    id: "6000", // Audi
    name: "Audi",
    models: [
      "A1",
      "A3",
      "A4",
      "A5",
      "A6",
      "A7",
      "A8",
      "Q2",
      "Q3",
      "Q4",
      "Q5",
      "Q7",
      "Q8",
      "e-tron",
      "TT",
      "R8",
    ],
  },
  {
    id: "9000", // Volkswagen
    name: "Volkswagen",
    models: [
      "Polo",
      "Golf",
      "Passat",
      "Arteon",
      "Tiguan",
      "Touareg",
      "T-Cross",
      "T-Roc",
      "ID.3",
      "ID.4",
      "ID.5",
    ],
  },
  {
    id: "17200", // Porsche
    name: "Porsche",
    models: [
      "911",
      "718",
      "Panamera",
      "Cayenne",
      "Macan",
      "Taycan",
    ],
  },
  {
    id: "2020", // Ford
    name: "Ford",
    models: [
      "Fiesta",
      "Focus",
      "Mondeo",
      "Kuga",
      "Edge",
      "Explorer",
      "Mustang",
      "Puma",
    ],
  },
  {
    id: "8800", // Peugeot
    name: "Peugeot",
    models: [
      "208",
      "308",
      "508",
      "2008",
      "3008",
      "5008",
      "Partner",
      "Expert",
    ],
  },
  {
    id: "8800", // Renault
    name: "Renault",
    models: [
      "Clio",
      "Mégane",
      "Talisman",
      "Captur",
      "Kadjar",
      "Koleos",
      "Scénic",
      "Zoe",
    ],
  },
  {
    id: "17400", // Tesla
    name: "Tesla",
    models: [
      "Model 3",
      "Model S",
      "Model X",
      "Model Y",
    ],
  },
  {
    id: "17400", // Toyota
    name: "Toyota",
    models: [
      "Yaris",
      "Corolla",
      "Camry",
      "RAV4",
      "Highlander",
      "Prius",
      "C-HR",
      "Land Cruiser",
    ],
  },
];

export function getBrandById(id: string): VehicleBrand | undefined {
  return VEHICLE_BRANDS.find((brand) => brand.id === id);
}

export function getBrandByName(name: string): VehicleBrand | undefined {
  return VEHICLE_BRANDS.find(
    (brand) => brand.name.toLowerCase() === name.toLowerCase()
  );
}
