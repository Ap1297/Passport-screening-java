package com.passport.screening.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "sanctioned_individuals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanctionedIndividual {
	private String id;

	@Indexed
	private String name;

	private LocalDateTime createdDate;
}
