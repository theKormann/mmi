package com.mmi.infra;

import com.mmi.models.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByUuid(UUID uuid);
}
