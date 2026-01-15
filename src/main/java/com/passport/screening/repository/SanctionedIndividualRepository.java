package com.passport.screening.repository;

import com.passport.screening.model.SanctionedIndividual;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanctionedIndividualRepository extends MongoRepository<SanctionedIndividual, String> {
    
    Optional<SanctionedIndividual> findByNameIgnoreCase(String name);
    
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<SanctionedIndividual> findByNameContaining(String namePattern);
}
