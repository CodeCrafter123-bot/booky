package com.hussein.booky.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {


@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer id;

private LocalDateTime appointmentTime;

private String status;

@ManyToOne
@JoinColumn(name = "user_id")
private User user;

@ManyToOne
@JoinColumn(name = "service_id")
private BookyService service;

public Booking() {
}

public Integer getId() {
    return id;
}

public void setId(Integer id) {
    this.id = id;
}

public LocalDateTime getAppointmentTime() {
    return appointmentTime;
}

public void setAppointmentTime(LocalDateTime appointmentTime) {
    this.appointmentTime = appointmentTime;
}

public String getStatus() {
    return status;
}

public void setStatus(String status) {
    this.status = status;
}

public User getUser() {
    return user;
}

public void setUser(User user) {
    this.user = user;
}

public BookyService getService() {
    return service;
}

public void setService(BookyService service) {
    this.service = service;
}


}
