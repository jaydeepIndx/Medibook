class SlotAlreadyBooked(Exception):
    pass

class AppointmentNotFound(Exception):
    pass


class AppointmentNotOwned(Exception):
    pass


class AppointmentNotCancellable(Exception):
    pass


class CancelTooLate(Exception):
    pass


class DoctorNotAssigned(Exception):
    pass


class AppointmentNotActive(Exception):
    pass


class PrescriptionAlreadyExists(Exception):
    pass

class PrescriptionNotFound(Exception):
    pass