package com.mmi.infra;

import com.mmi.models.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    @Query("SELECT l FROM Lead l LEFT JOIN FETCH l.property")
    List<Lead> findAllWithProperty();

    Optional<Lead> findByTelefone(String telefone);

    Optional<Lead> findByEmail(String email);

}