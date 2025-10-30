package com.mmi.api.services;

import com.mmi.infra.TrackingEventRepository;
import com.mmi.models.Lead;
import com.mmi.models.TrackingEvent;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TrackingService {

    private final TrackingEventRepository trackingEventRepository;
    private final GeoLocationService geoLocationService;

    public TrackingService(TrackingEventRepository trackingEventRepository,
                           GeoLocationService geoLocationService) {
        this.trackingEventRepository = trackingEventRepository;
        this.geoLocationService = geoLocationService;
    }

    public List<TrackingEvent> getVisitorHistory(String visitorId) {
        return trackingEventRepository.findByVisitorId(visitorId);
    }

    public List<String> getUniqueAnonymousVisitors() {
        return trackingEventRepository.findDistinctAnonymousVisitorIds();
    }

    public void saveEvent(TrackingEvent event, String ipAddress) {
        // Define o IP
        event.setIpAddress(ipAddress);

        // Busca região
        GeoLocationService.GeoLocation location = geoLocationService.getLocation(ipAddress);
        event.setCountry(location.getCountry());
        event.setRegion(location.getRegion());
        event.setCity(location.getCity());

        trackingEventRepository.save(event);
    }

    @Transactional
    public void associateEventsToLead(String visitorId, Lead lead) {
        List<TrackingEvent> events = trackingEventRepository.findByVisitorId(visitorId);

        for (TrackingEvent event : events) {
            if (event.getLead() == null) {
                event.setLead(lead);
                trackingEventRepository.save(event);
            }
        }
    }

    public List<TrackingEvent> getLeadHistory(Long leadId) {
        return trackingEventRepository.findByLeadId(leadId);
    }
}
