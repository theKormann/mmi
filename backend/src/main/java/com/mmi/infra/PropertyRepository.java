package com.mmi.infra;

import com.mmi.models.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    @Override
    Optional<Property> findById(Long id);
}
