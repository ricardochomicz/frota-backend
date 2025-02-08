-- Tabela de veículos
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  mileage INT NOT NULL,
  fuel_type ENUM('gasoline', 'diesel', 'electric', 'hybrid') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de pneus
CREATE TABLE IF NOT EXISTS tires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code VARCHAR(50) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  durability_km INT NOT NULL,
  status ENUM('available', 'in use', 'lower') NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_tires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,               
  tire_id INT NOT NULL,      
  user_id INT NOT NULL,        
  maintenance_id INT NULL,    
  installation_date DATE NOT NULL,       
  mileage_at_installation INT NOT NULL,  
  predicted_replacement_mileage INT NOT NULL, 
  to_replace BOOLEAN NULL DEFAULT FALSE,
  mileage_to_replace INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (tire_id) REFERENCES tires(id) ON DELETE CASCADE
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  FOREIGN key (maintenance_id) REFERENCES maintenance(id) ON DELETE CASCADE
);

-- Tabela de manutenção
CREATE TABLE IF NOT EXISTS maintenance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  mileage_at_maintenance INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('PENDENTE', 'CONCLUIDA') NULL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  manager_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;
);

-- Tabela de análise de custos
CREATE TABLE IF NOT EXISTS cost_analysis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  user_id INT NOT NULL,
  vehicle_tire_id INT NULL,
  tire_id INT NULL,
  item_type VARCHAR(50) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  performance_score INT NOT NULL,
  replacement_reason VARCHAR(100) NULL,
  description TEXT NULL
  mileage_driven INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  FOREIGN KEY (vehicle_tire_id) REFERENCES vehicle_tires(id) ON DELETE CASCADE
  FOREIGN KEY (tire_id) REFERENCES tires(id) ON DELETE CASCADE
);



