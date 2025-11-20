/**
 * Travel Package Contract Integration
 * 
 * Este módulo proporciona funciones para interactuar con el contrato de paquetes de viaje
 * desde el frontend de Next.js
 */

import { Keypair, scValToNative } from '@stellar/js-stellar-sdk';
import { SorobanClient } from './soroban-client'; // Asume que existe

export interface TravelPackageUI {
  packageId: number;
  destination: string;
  priceXLM: number;
  durationDays: number;
  maxStudents: number;
  enrolledStudents: number;
  minCreditScore: number;
  active: boolean;
}

export interface TravelBookingUI {
  bookingId: number;
  destination: string;
  amountXLM: number;
  creditScore: number;
  bookingDate: Date;
  departureDate: Date;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface TransactionUI {
  transactionId: number;
  packageId: number;
  amountXLM: number;
  timestamp: Date;
  status: string;
}

class TravelPackageService {
  private client: SorobanClient;
  private contractId: string;

  constructor(client: SorobanClient, contractId: string) {
    this.client = client;
    this.contractId = contractId;
  }

  /**
   * Obtener todos los paquetes disponibles
   */
  async getAvailablePackages(): Promise<TravelPackageUI[]> {
    try {
      const result = await this.client.invokeContract(
        this.contractId,
        'get_packages',
        []
      );

      const packages = scValToNative(result);
      return this.formatPackages(packages);
    } catch (error) {
      console.error('Error getting packages:', error);
      throw error;
    }
  }

  /**
   * Verificar si un estudiante es elegible para un paquete
   */
  async checkEligibility(
    studentAddress: string,
    packageId: number,
    creditScore: number
  ): Promise<boolean> {
    try {
      const result = await this.client.invokeContract(
        this.contractId,
        'check_eligibility',
        [
          { type: 'address', value: studentAddress },
          { type: 'u32', value: packageId },
          { type: 'u32', value: creditScore }
        ]
      );

      return scValToNative(result);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return false;
    }
  }

  /**
   * Reservar un paquete de viaje
   * Esto libera el dinero automáticamente del pool
   */
  async bookPackage(
    studentAddress: string,
    packageId: number,
    creditScore: number,
    keypair: Keypair
  ): Promise<TravelBookingUI> {
    try {
      console.log(`Booking package ${packageId} for student ${studentAddress}...`);

      const result = await this.client.invokeContract(
        this.contractId,
        'book_package',
        [
          { type: 'address', value: studentAddress },
          { type: 'u32', value: packageId },
          { type: 'u32', value: creditScore }
        ],
        keypair
      );

      const booking = scValToNative(result);
      return this.formatBooking(booking);
    } catch (error) {
      console.error('Error booking package:', error);
      throw error;
    }
  }

  /**
   * Obtener el historial de reservas de un estudiante
   */
  async getStudentBookings(studentAddress: string): Promise<TravelBookingUI[]> {
    try {
      const result = await this.client.invokeContract(
        this.contractId,
        'get_student_bookings',
        [{ type: 'address', value: studentAddress }]
      );

      const bookings = scValToNative(result);
      return this.formatBookings(bookings);
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  }

  /**
   * Obtener el historial de transacciones de un estudiante
   */
  async getTransactionHistory(studentAddress: string): Promise<TransactionUI[]> {
    try {
      const result = await this.client.invokeContract(
        this.contractId,
        'get_transaction_history',
        [{ type: 'address', value: studentAddress }]
      );

      const history = scValToNative(result);
      return this.formatTransactions(history);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * Obtener el balance del pool (solo lectura)
   */
  async getPoolBalance(): Promise<number> {
    try {
      const result = await this.client.invokeContract(
        this.contractId,
        'get_pool_balance',
        []
      );

      const balanceStroops = scValToNative(result);
      return balanceStroops / 10_000_000; // Convertir stroops a XLM
    } catch (error) {
      console.error('Error getting pool balance:', error);
      return 0;
    }
  }

  /**
   * Cancelar una reserva
   */
  async cancelBooking(
    studentAddress: string,
    bookingId: number,
    keypair: Keypair
  ): Promise<number> {
    try {
      const result = await this.client.invokeContract(
        this.contractId,
        'cancel_booking',
        [
          { type: 'address', value: studentAddress },
          { type: 'u32', value: bookingId }
        ],
        keypair
      );

      const newBalance = scValToNative(result);
      return newBalance / 10_000_000; // Stroops to XLM
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // ========== HELPER FUNCTIONS ==========

  private formatPackages(rawPackages: any[]): TravelPackageUI[] {
    return rawPackages.map(pkg => ({
      packageId: pkg.package_id,
      destination: this.symbolToString(pkg.destination),
      priceXLM: pkg.price / 10_000_000,
      durationDays: pkg.duration_days,
      maxStudents: pkg.max_students,
      enrolledStudents: pkg.enrolled_students,
      minCreditScore: pkg.min_credit_score,
      active: pkg.active
    }));
  }

  private formatBooking(rawBooking: any): TravelBookingUI {
    return {
      bookingId: rawBooking.booking_id,
      destination: this.symbolToString(rawBooking.destination),
      amountXLM: rawBooking.amount_disbursed / 10_000_000,
      creditScore: rawBooking.credit_score,
      bookingDate: new Date(rawBooking.booking_date * 1000),
      departureDate: new Date(rawBooking.departure_date * 1000),
      status: this.symbolToString(rawBooking.status) as any
    };
  }

  private formatBookings(rawBookings: any[]): TravelBookingUI[] {
    return rawBookings.map(booking => this.formatBooking(booking));
  }

  private formatTransactions(rawTransactions: any[]): TransactionUI[] {
    return rawTransactions.map(tx => ({
      transactionId: tx.transaction_id,
      packageId: tx.package_id,
      amountXLM: tx.amount / 10_000_000,
      timestamp: new Date(tx.timestamp * 1000),
      status: this.symbolToString(tx.status)
    }));
  }

  private symbolToString(symbol: any): string {
    if (typeof symbol === 'string') {
      return symbol;
    }
    // Si es un objeto Symbol de Soroban
    return symbol.toString();
  }
}

// ========== REACT HOOK ==========

import { useState, useCallback } from 'react';

export function useTravelPackages(
  client: SorobanClient,
  contractId: string,
  studentAddress: string
) {
  const [packages, setPackages] = useState<TravelPackageUI[]>([]);
  const [bookings, setBookings] = useState<TravelBookingUI[]>([]);
  const [history, setHistory] = useState<TransactionUI[]>([]);
  const [poolBalance, setPoolBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new TravelPackageService(client, contractId);

  // Cargar paquetes disponibles
  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAvailablePackages();
      setPackages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar reservas del estudiante
  const loadBookings = useCallback(async () => {
    if (!studentAddress) return;
    setLoading(true);
    setError(null);
    try {
      const data = await service.getStudentBookings(studentAddress);
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentAddress]);

  // Cargar historial de transacciones
  const loadHistory = useCallback(async () => {
    if (!studentAddress) return;
    setLoading(true);
    setError(null);
    try {
      const data = await service.getTransactionHistory(studentAddress);
      setHistory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentAddress]);

  // Cargar balance del pool
  const loadPoolBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const balance = await service.getPoolBalance();
      setPoolBalance(balance);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar elegibilidad
  const checkEligibility = useCallback(
    async (packageId: number, creditScore: number): Promise<boolean> => {
      if (!studentAddress) return false;
      try {
        return await service.checkEligibility(studentAddress, packageId, creditScore);
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },
    [studentAddress]
  );

  // Realizar reserva
  const bookPackage = useCallback(
    async (packageId: number, creditScore: number, keypair: Keypair) => {
      if (!studentAddress) throw new Error('No student address');
      setLoading(true);
      setError(null);
      try {
        const booking = await service.bookPackage(
          studentAddress,
          packageId,
          creditScore,
          keypair
        );
        // Recargar datos
        await loadBookings();
        await loadHistory();
        await loadPoolBalance();
        return booking;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [studentAddress, loadBookings, loadHistory, loadPoolBalance]
  );

  // Cancelar reserva
  const cancelBooking = useCallback(
    async (bookingId: number, keypair: Keypair) => {
      if (!studentAddress) throw new Error('No student address');
      setLoading(true);
      setError(null);
      try {
        const newBalance = await service.cancelBooking(studentAddress, bookingId, keypair);
        // Recargar datos
        await loadBookings();
        await loadHistory();
        await loadPoolBalance();
        return newBalance;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [studentAddress, loadBookings, loadHistory, loadPoolBalance]
  );

  return {
    packages,
    bookings,
    history,
    poolBalance,
    loading,
    error,
    loadPackages,
    loadBookings,
    loadHistory,
    loadPoolBalance,
    checkEligibility,
    bookPackage,
    cancelBooking
  };
}

// ========== EXPORT ==========

export { TravelPackageService };
