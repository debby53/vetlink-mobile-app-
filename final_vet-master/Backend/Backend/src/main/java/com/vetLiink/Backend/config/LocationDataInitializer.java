package com.vetLiink.Backend.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import com.vetLiink.Backend.entity.ELocationType;
import com.vetLiink.Backend.entity.Location;
import com.vetLiink.Backend.repository.LocationRepository;

@Configuration
public class LocationDataInitializer {

    @Bean
    public ApplicationRunner initializeLocations(LocationRepository locationRepository, JdbcTemplate jdbcTemplate) {
        return args -> {
            // Check if locations already exist to avoid overwriting/clearing valid data
            Long count = locationRepository.count();
            if (count > 0) {
                System.out.println("✅ Location data already exists (" + count + " records). Skipping initialization to preserve data integrity.");
                return;
            }

            System.out.println("🔄 Initializing Rwanda location data...");

            // ========== CITY OF KIGALI ==========
            Location kigali = locationRepository.save(
                new Location(ELocationType.PROVINCE, "CITY_OF_KIGALI", "KGL", null, "City of Kigali")
            );

            // Gasabo District
            Location gasabo = locationRepository.save(
                new Location(ELocationType.DISTRICT, "GASABO_DISTRICT", "GSB", kigali, "Gasabo")
            );
            createSectors(locationRepository, gasabo, new String[]{
                "Bumbogo", "Gatsata", "Gikomero", "Gisozi", "Jabana", "Jali", 
                "Kacyiru", "Kimihurura", "Kinyinya", "Ndera", "Nduba", "Remera", "Rusororo", "Rutunga"
            });

            // Kicukiro District
            Location kicukiro = locationRepository.save(
                new Location(ELocationType.DISTRICT, "KICUKIRO_DISTRICT", "KCK", kigali, "Kicukiro")
            );
            createSectors(locationRepository, kicukiro, new String[]{
                "Gahanga", "Gatenga", "Gikondo", "Kagarama", "Kanombe", 
                "Kicukiro", "Kigarama", "Masaka", "Niboye", "Nyarugunga"
            });

            // Nyarugenge District
            Location nyarugenge = locationRepository.save(
                new Location(ELocationType.DISTRICT, "NYARUGENGE_DISTRICT", "NYG", kigali, "Nyarugenge")
            );
            createSectors(locationRepository, nyarugenge, new String[]{
                "Gitega", "Kanyinya", "Kigali", "Kimisagara", "Mageragere", 
                "Muhima", "Nyakabanda", "Nyamirambo", "Nyarugenge", "Rwezamenyo"
            });

            // ========== EASTERN PROVINCE ==========
            Location eastern = locationRepository.save(
                new Location(ELocationType.PROVINCE, "EASTERN_PROVINCE", "EP", null, "Eastern Province")
            );

            // Bugesera District
            Location bugesera = locationRepository.save(
                new Location(ELocationType.DISTRICT, "BUGESERA_DISTRICT", "BGS", eastern, "Bugesera")
            );
            createSectors(locationRepository, bugesera, new String[]{
                "Gashora", "Juru", "Kamabuye", "Mareba", "Mayange", "Musenyi", 
                "Mwogo", "Ngeruka", "Ntarama", "Nyamata", "Rilima", "Ruhuha", "Rweru", "Shyara"
            });

            // Gatsibo District
            Location gatsibo = locationRepository.save(
                new Location(ELocationType.DISTRICT, "GATSIBO_DISTRICT", "GTS", eastern, "Gatsibo")
            );
            createSectors(locationRepository, gatsibo, new String[]{
                "Gasange", "Gatsibo", "Gitoki", "Kabarore", "Kageyo", "Kiramuruzi", 
                "Kiziguro", "Muhura", "Murambi", "Ngarama", "Nyagihanga", "Remera", "Rugarama", "Rwimbogo"
            });

            // Kayonza District
            Location kayonza = locationRepository.save(
                new Location(ELocationType.DISTRICT, "KAYONZA_DISTRICT", "KYZ", eastern, "Kayonza")
            );
            createSectors(locationRepository, kayonza, new String[]{
                "Gahini", "Kabare", "Kabarondo", "Mukarange", "Murama", "Murundi", 
                "Mwiri", "Ndego", "Nyamirama", "Rukara", "Ruramira", "Rwinkwavu"
            });

            // Kirehe District
            Location kirehe = locationRepository.save(
                new Location(ELocationType.DISTRICT, "KIREHE_DISTRICT", "KRH", eastern, "Kirehe")
            );
            createSectors(locationRepository, kirehe, new String[]{
                "Gahara", "Gatore", "Kigarama", "Kigina", "Kirehe", "Mahama", 
                "Mpanga", "Musaza", "Mushikiri", "Nasho", "Nyamugari", "Nyarubuye"
            });

            // Ngoma District
            Location ngoma = locationRepository.save(
                new Location(ELocationType.DISTRICT, "NGOMA_DISTRICT", "NGM", eastern, "Ngoma")
            );
            createSectors(locationRepository, ngoma, new String[]{
                "Gashanda", "Jarama", "Karembo", "Kazo", "Kibungo", "Mugesera", 
                "Murama", "Nyamirama", "Rukira", "Rukumberi", "Rurenge", "Sake", "Zaza"
            });

            // Nyagatare District
            Location nyagatare = locationRepository.save(
                new Location(ELocationType.DISTRICT, "NYAGATARE_DISTRICT", "NYT", eastern, "Nyagatare")
            );
            createSectors(locationRepository, nyagatare, new String[]{
                "Gatunda", "Karama", "Karangazi", "Katabagemu", "Kiyombe", 
                "Matimba", "Mimuli", "Mukama", "Musheli", "Nyagatare", "Rukomo", "Rwempasha", "Rwimiyaga", "Tabagwe"
            });

            // Rwamagana District
            Location rwamagana = locationRepository.save(
                new Location(ELocationType.DISTRICT, "RWAMAGANA_DISTRICT", "RWM", eastern, "Rwamagana")
            );
            createSectors(locationRepository, rwamagana, new String[]{
                "Fumbwe", "Gahengeri", "Gishali", "Karenge", "Kigabiro", 
                "Muhazi", "Munyaga", "Munyiginya", "Musha", "Muyumbu", "Mwulire", "Nyakariro", "Nzige", "Rubona"
            });

            // ========== NORTHERN PROVINCE ==========
            Location northern = locationRepository.save(
                new Location(ELocationType.PROVINCE, "NORTHERN_PROVINCE", "NP", null, "Northern Province")
            );

            // Burera District
            Location burera = locationRepository.save(
                new Location(ELocationType.DISTRICT, "BURERA_DISTRICT", "BUR", northern, "Burera")
            );
            createSectors(locationRepository, burera, new String[]{
                "Bungwe", "Butaro", "Cyanika", "Cyeru", "Gahunga", "Gatebe", 
                "Gitovu", "Kagogo", "Kinoni", "Kinyababa", "Kivuye", "Nemba", "Rugarama", "Rugendabari", 
                "Ruhunde", "Rusarabuge", "Rwerere"
            });

            // Gakenke District
            Location gakenke = locationRepository.save(
                new Location(ELocationType.DISTRICT, "GAKENKE_DISTRICT", "GKE", northern, "Gakenke")
            );
            createSectors(locationRepository, gakenke, new String[]{
                "Busengo", "Coko", "Cyabingo", "Gakenke", "Gashenyi", "Janja", 
                "Kamubuga", "Karambo", "Kivuruga", "Mataba", "Minazi", "Mugunga", "Muhondo", "Muyongwe", 
                "Muzo", "Nemba", "Ruli", "Rusasa", "Rushashi"
            });

            // Gicumbi District
            Location gicumbi = locationRepository.save(
                new Location(ELocationType.DISTRICT, "GICUMBI_DISTRICT", "GCB", northern, "Gicumbi")
            );
            createSectors(locationRepository, gicumbi, new String[]{
                "Bukure", "Bwisige", "Byumba", "Cyumba", "Giti", "Kaniga", 
                "Manyagiro", "Miyove", "Mukama", "Muko", "Mutete", "Nyamiyaga", "Nyankenke", "Rubaya", 
                "Rukomo", "Rushaki", "Rutare", "Ruvune", "Rwamiko", "Shangasha"
            });

            // Musanze District
            Location musanze = locationRepository.save(
                new Location(ELocationType.DISTRICT, "MUSANZE_DISTRICT", "MSZ", northern, "Musanze")
            );
            createSectors(locationRepository, musanze, new String[]{
                "Busogo", "Cyuve", "Gacaca", "Gashaki", "Gataraga", "Kimonyi", 
                "Kinigi", "Muhoza", "Muko", "Musanze", "Nkotsi", "Nyange", "Remera", "Rwaza", "Shingiro"
            });

            // Rulindo District
            Location rulindo = locationRepository.save(
                new Location(ELocationType.DISTRICT, "RULINDO_DISTRICT", "RLD", northern, "Rulindo")
            );
            createSectors(locationRepository, rulindo, new String[]{
                "Base", "Burega", "Bushoki", "Buyoga", "Cyinzuzi", "Cyungo", 
                "Kinihira", "Kisaro", "Masoro", "Mbogo", "Murambi", "Ngoma", "Ntarabana", "Rukozo", 
                "Rusiga", "Shyorongi", "Tumba"
            });

            long totalCount = locationRepository.count();
            System.out.println("✅ Rwanda location data initialized successfully!");
            System.out.println("   📍 Total locations: " + totalCount);
            System.out.println("   🏛️  3 Provinces");
            System.out.println("   🏘️  13 Districts");
            System.out.println("   📌 " + (totalCount - 16) + " Sectors");
        };
    }

    private void createSectors(LocationRepository repository, Location district, String[] sectors) {
        for (String sector : sectors) {
            // Uniqueness strategy: Append district code to name and code
            // Name: REMERA_GSB_SECTOR (if Remera in Gasabo)
            // Code: REM-GSB
            String baseName = sector.toUpperCase().replace(" ", "_");
            String uniqueName = baseName + "_" + district.getCode() + "_SECTOR";
            String codePrefix = sector.substring(0, Math.min(3, sector.length())).toUpperCase();
            String uniqueCode = codePrefix + "-" + district.getCode();
            
            repository.save(new Location(ELocationType.SECTOR, uniqueName, uniqueCode, district, sector));
        }
    }
}
