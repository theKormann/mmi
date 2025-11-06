package com.mmi.infra;

import com.mmi.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.lead l LEFT JOIN FETCH l.property")
    List<Payment> findAllWithLeadAndProperty();

    List<Payment> findByDataRecebimentoBetween(LocalDate start, LocalDate end);
}
