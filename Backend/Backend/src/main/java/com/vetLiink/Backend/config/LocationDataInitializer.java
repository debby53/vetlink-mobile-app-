package com.vetLiink.Backend.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.vetLiink.Backend.entity.ELocationType;
import com.vetLiink.Backend.entity.Location;
import com.vetLiink.Backend.repository.LocationRepository;

@Configuration
public class LocationDataInitializer {

    @Bean
    public ApplicationRunner initializeLocations(LocationRepository locationRepository) {
        return args -> {
            // Check if data already exists
            if (locationRepository.count() > 0) {
                return; // Data already initialized
            }

            // Create Provinces
            Location kigali = new Location(ELocationType.PROVINCE, "KIGALI", "KGL", null, "Kigali");
            kigali = locationRepository.save(kigali);

            Location northern = new Location(ELocationType.PROVINCE, "NORTHERN", "NP", null, "Northern Province");
            northern = locationRepository.save(northern);

            Location southern = new Location(ELocationType.PROVINCE, "SOUTHERN", "SP", null, "Southern Province");
            southern = locationRepository.save(southern);

            Location western = new Location(ELocationType.PROVINCE, "WESTERN", "WP", null, "Western Province");
            western = locationRepository.save(western);

            Location eastern = new Location(ELocationType.PROVINCE, "EASTERN", "EP", null, "Eastern Province");
            eastern = locationRepository.save(eastern);

            // Create Districts for Kigali
            Location gasabo = new Location(ELocationType.DISTRICT, "GASABO", "GSB", kigali, "Gasabo");
            gasabo = locationRepository.save(gasabo);

            Location kicukiro = new Location(ELocationType.DISTRICT, "KICUKIRO", "KCK", kigali, "Kicukiro");
            kicukiro = locationRepository.save(kicukiro);

            Location nyarugenge = new Location(ELocationType.DISTRICT, "NYARUGENGE", "NYG", kigali, "Nyarugenge");
            nyarugenge = locationRepository.save(nyarugenge);

            // Create Districts for Northern
            Location musanze = new Location(ELocationType.DISTRICT, "MUSANZE", "MSZ", northern, "Musanze");
            musanze = locationRepository.save(musanze);

            Location burera = new Location(ELocationType.DISTRICT, "BURERA", "BUR", northern, "Burera");
            burera = locationRepository.save(burera);

            // Create Districts for Southern
            Location huye = new Location(ELocationType.DISTRICT, "HUYE", "HYE", southern, "Huye");
            huye = locationRepository.save(huye);

            Location nyaruguru = new Location(ELocationType.DISTRICT, "NYARUGURU", "NYU", southern, "Nyaruguru");
            nyaruguru = locationRepository.save(nyaruguru);

            // Create Districts for Western
            Location rubavu = new Location(ELocationType.DISTRICT, "RUBAVU", "RBV", western, "Rubavu");
            rubavu = locationRepository.save(rubavu);

            Location nyungwe = new Location(ELocationType.DISTRICT, "NYUNGWE", "NYW", western, "Nyungwe");
            nyungwe = locationRepository.save(nyungwe);

            // Create Districts for Eastern
            Location ngoma = new Location(ELocationType.DISTRICT, "NGOMA", "NGM", eastern, "Ngoma");
            ngoma = locationRepository.save(ngoma);

            Location kirehe = new Location(ELocationType.DISTRICT, "KIREHE", "KRH", eastern, "Kirehe");
            kirehe = locationRepository.save(kirehe);

            // Create Sectors for Gasabo
            Location gisozi = new Location(ELocationType.SECTOR, "GISOZI", "GSZ", gasabo, "Gisozi");
            gisozi = locationRepository.save(gisozi);

            Location kanyinya = new Location(ELocationType.SECTOR, "KANYINYA", "KNY", gasabo, "Kanyinya");
            kanyinya = locationRepository.save(kanyinya);

            // Create Villages for Gisozi
            Location kigemeVillage = new Location(ELocationType.VILLAGE, "KIGEME_V", "KGM", gisozi, "Kigeme Village");
            kigemeVillage = locationRepository.save(kigemeVillage);

            Location kicukiroVillage = new Location(ELocationType.VILLAGE, "KICUKIRO_V", "KCK", gisozi, "Kicukiro Village");
            kicukiroVillage = locationRepository.save(kicukiroVillage);

            // Create Cells for Kigeme Village
            Location kigemeA = new Location(ELocationType.CELL, "KIGEME_A", "KGM_A", kigemeVillage, "Kigeme Cell A");
            locationRepository.save(kigemeA);

            Location kigemeB = new Location(ELocationType.CELL, "KIGEME_B", "KGM_B", kigemeVillage, "Kigeme Cell B");
            locationRepository.save(kigemeB);

            Location kigemeC = new Location(ELocationType.CELL, "KIGEME_C", "KGM_C", kigemeVillage, "Kigeme Cell C");
            locationRepository.save(kigemeC);

            // Create Cells for Kicukiro Village
            Location kicukiroA = new Location(ELocationType.CELL, "KICUKIRO_A", "KCK_A", kicukiroVillage, "Kicukiro Cell A");
            locationRepository.save(kicukiroA);

            Location kicukiroB = new Location(ELocationType.CELL, "KICUKIRO_B", "KCK_B", kicukiroVillage, "Kicukiro Cell B");
            locationRepository.save(kicukiroB);

            System.out.println("Location data initialized successfully!");
        };
    }
}
