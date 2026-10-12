CREATE DATABASE IF NOT EXISTS dental_clinic;
USE dental_clinic;
DROP TABLE IF EXISTS treatments, appointments, services, patients, dentists, users;
CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY,email VARCHAR(100) NOT NULL UNIQUE,password VARCHAR(100) NOT NULL);
CREATE TABLE dentists(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,specialization VARCHAR(100) NOT NULL,schedule VARCHAR(150),phone VARCHAR(20));
CREATE TABLE patients(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,phone VARCHAR(20) NOT NULL,email VARCHAR(100),dob DATE,address VARCHAR(200));
CREATE TABLE services(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,cost DECIMAL(10,2) NOT NULL,duration INT NOT NULL);
CREATE TABLE appointments(id INT AUTO_INCREMENT PRIMARY KEY,patient_id INT NOT NULL,dentist_id INT NOT NULL,service_id INT NOT NULL,
 appt_date DATE NOT NULL,appt_time TIME NOT NULL,status ENUM('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',amount DECIMAL(10,2) DEFAULT 0,
 payment_status ENUM('Pending','Paid') DEFAULT 'Pending',payment_mode ENUM('Cash','Card','UPI','Insurance') NULL,txn_ref VARCHAR(30) NULL,
 UNIQUE(dentist_id,appt_date,appt_time),FOREIGN KEY(patient_id) REFERENCES patients(id),FOREIGN KEY(dentist_id) REFERENCES dentists(id),FOREIGN KEY(service_id) REFERENCES services(id));
CREATE TABLE treatments(id INT AUTO_INCREMENT PRIMARY KEY,patient_id INT NOT NULL,dentist_id INT NOT NULL,visit_date DATE NOT NULL,diagnosis TEXT NOT NULL,prescription TEXT,
 FOREIGN KEY(patient_id) REFERENCES patients(id),FOREIGN KEY(dentist_id) REFERENCES dentists(id));

-- Seed data (admin user is created automatically on first server start)
INSERT INTO dentists(name,specialization,schedule,phone) VALUES('Dr. Sarah Lee','Orthodontist','Mon-Fri 09:00-16:00','555-0101'),('Dr. James Carter','Endodontist','Mon,Wed,Fri 10:00-18:00','555-0102'),('Dr. Priya Nair','General Dentist','Tue-Sat 08:00-15:00','555-0103');
INSERT INTO patients(name,phone,email,dob,address) VALUES('John Smith','555-1001','john@example.com','1985-03-12','12 Oak St'),('Maria Garcia','555-1002','maria@example.com','1992-07-25','45 Pine Ave'),('Ahmed Khan','555-1003','ahmed@example.com','1978-11-02','8 Lake Rd'),('Emily Chen','555-1004','emily@example.com','2001-01-19','77 Hill Dr');
INSERT INTO services(name,cost,duration) VALUES('Consultation',30,20),('Teeth Cleaning',60,30),('Root Canal',350,90),('Tooth Filling',120,45),('Braces Adjustment',80,30);
INSERT INTO appointments(patient_id,dentist_id,service_id,appt_date,appt_time,status,amount,payment_status,payment_mode,txn_ref) VALUES
(1,3,2,CURDATE(),'09:00','Scheduled',60,'Pending',NULL,NULL),(2,1,5,CURDATE(),'10:30','Scheduled',80,'Pending',NULL,NULL),
(3,2,3,CURDATE()-INTERVAL 3 DAY,'11:00','Completed',350,'Paid','Card','TXN1001'),(4,3,4,CURDATE()-INTERVAL 7 DAY,'14:00','Completed',120,'Paid','Cash','TXN1002'),
(1,1,1,CURDATE()+INTERVAL 2 DAY,'09:30','Scheduled',30,'Pending',NULL,NULL);
INSERT INTO treatments(patient_id,dentist_id,visit_date,diagnosis,prescription) VALUES
(3,2,CURDATE()-INTERVAL 3 DAY,'Irreversible pulpitis, tooth 36','Amoxicillin 500mg TID x5d; Ibuprofen 400mg PRN'),
(4,3,CURDATE()-INTERVAL 7 DAY,'Occlusal caries, tooth 46','Chlorhexidine rinse x7 days'),
(1,3,CURDATE()-INTERVAL 30 DAY,'Mild gingivitis','Soft-bristle brush; floss daily');
