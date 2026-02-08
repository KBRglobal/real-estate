import type { Project } from "@shared/schema";

export interface Highlight {
  icon?: string;
  title?: string;
  titleHe?: string;
  value?: string;
}

export interface AmenityItem {
  icon?: string;
  name?: string;
  nameHe?: string;
}

export interface AmenityCategory {
  category?: string;
  items?: AmenityItem[];
}

export interface Unit {
  type?: string;
  typeHe?: string;
  bedrooms?: string;
  size?: string;
  sizeFrom?: number;
  sizeTo?: number;
  sizeUnit?: string;
  price?: string;
  priceFrom?: number;
  priceTo?: number;
  priceCurrency?: string;
  status?: string;
  floor?: string;
  view?: string;
  parking?: number;
}

export interface PaymentMilestone {
  milestone?: string;
  percentage?: number;
  description?: string;
}

export interface GalleryItem {
  url?: string;
  alt?: string;
  type?: "image" | "video";
  category?: "exterior" | "interior" | "amenities" | "views";
}

export interface NearbyPlace {
  name?: string;
  nameEn?: string;
  distance?: string;
  driveTime?: string;
  type?: string;
}

export interface Neighborhood {
  description?: string;
  descriptionEn?: string;
  nearbyPlaces?: NearbyPlace[];
}

export interface FAQ {
  question?: string;
  answer?: string;
}

export type { Project };
