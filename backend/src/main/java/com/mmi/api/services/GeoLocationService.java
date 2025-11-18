package com.mmi.api.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.json.JSONObject;

@Service
public class GeoLocationService {

    private static final String API_URL = "https://ipapi.co/{ip}/json/";

    public GeoLocation getLocation(String ip) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = UriComponentsBuilder.fromUriString(API_URL)
                    .buildAndExpand(ip)
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JSONObject json = new JSONObject(response);

            GeoLocation location = new GeoLocation();
            location.setCountry(json.optString("country_name"));
            location.setRegion(json.optString("region"));
            location.setCity(json.optString("city"));
            return location;

        } catch (Exception e) {
            GeoLocation location = new GeoLocation();
            location.setCountry("Desconhecido");
            location.setRegion("Desconhecido");
            location.setCity("Desconhecido");
            return location;
        }
    }

    public static class GeoLocation {
        private String country;
        private String region;
        private String city;

        // Getters e setters
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
    }
}
