package com.mmi.infra;

import com.mmi.models.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {
    List<TrackingEvent> findByVisitorId(String visitorId);
    List<TrackingEvent> findByLeadId(Long leadId);
    @Query("SELECT DISTINCT t.visitorId FROM TrackingEvent t WHERE t.lead IS NULL")
    List<String> findDistinctAnonymousVisitorIds();
}