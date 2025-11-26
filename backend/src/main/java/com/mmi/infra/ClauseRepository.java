package com.mmi.infra;

import com.mmi.models.Clause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClauseRepository extends JpaRepository<Clause, Long> {
    // JpaRepository já nos dá os métodos:
    // .save() (cria e atualiza)
    // .findAll() (lista todos)
    // .findById() (busca um)
    // .deleteById() (deleta)
}