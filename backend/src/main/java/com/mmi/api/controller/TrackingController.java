package com.mmi.api.controller;

import com.mmi.models.TrackingEvent;
import com.mmi.api.services.TrackingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/track")
public class TrackingController {

    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping("/{leadId}/history")
    public ResponseEntity<List<TrackingEvent>> getLeadHistory(@PathVariable Long leadId) {
        List<TrackingEvent> history = trackingService.getLeadHistory(leadId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<String>> getAnonymousVisitors() {
        List<String> visitorIds = trackingService.getUniqueAnonymousVisitors();
        return ResponseEntity.ok(visitorIds);
    }


    @GetMapping("/visitor/{visitorId}")
    public ResponseEntity<List<TrackingEvent>> getVisitorHistory(@PathVariable String visitorId) {
        List<TrackingEvent> history = trackingService.getVisitorHistory(visitorId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/event")
    public ResponseEntity<Void> trackEvent(@RequestBody TrackingEvent event,
                                           HttpServletRequest request) {
        event.setLead(null);

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }

        trackingService.saveEvent(event, ip);
        return ResponseEntity.ok().build();
    }

}