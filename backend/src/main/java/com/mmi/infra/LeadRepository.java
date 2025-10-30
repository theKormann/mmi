package com.mmi.infra;

import com.mmi.models.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    @Query("SELECT l FROM Lead l LEFT JOIN FETCH l.property")
    List<Lead> findAllWithProperty();

}