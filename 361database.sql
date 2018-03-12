

CREATE TABLE report (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  reportDate DATE,
  incidentDate DATE,
  anonymous BOOLEAN,
  reportingPartyId INT UNSIGNED,
  accused VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY  (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE company (
   id INT UNSIGNED NOT NULL AUTO_INCREMENT,
   name VARCHAR(255),
   hr_employee_id INT UNSIGNED NOT NULL,
   PRIMARY KEY  (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE company_employee (
   employee_id INT UNSIGNED NOT NULL,
   company_id INT UNSIGNED NOT NULL,
   PRIMARY KEY (employee_id, company_id),
   FOREIGN KEY (employee_id) REFERENCES employee (id),
   FOREIGN KEY (company_id) REFERENCES company (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;