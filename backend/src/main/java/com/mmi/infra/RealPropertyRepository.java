package com.mmi.infra;

import com.mmi.models.RealProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RealPropertyRepository extends JpaRepository<RealProperty, Long> {
}